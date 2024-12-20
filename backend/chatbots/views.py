import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse, StreamingHttpResponse
from .serializers import ChatbotListSerializer, ChatbotDetailSerializer
from .models import Chatbot
from .tasks import train_chatbot_task
import base64
from .consumers import InternalChatConsumer
from asgiref.sync import async_to_sync
import json
import asyncio
from rest_framework.renderers import BaseRenderer


logger = logging.getLogger(__name__)


class EventStreamRenderer(BaseRenderer):
    media_type = "text/event-stream"
    format = "text"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class ChatbotView(APIView):
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # chatbots = Chatbot.objects.filter(non_existent_field=True)
            chatbots = Chatbot.objects.filter(organization=request.user.organization)
            serializer = ChatbotListSerializer(chatbots, many=True)
            return Response(
                {
                    "success": True,
                    "chatbots": serializer.data,
                    "message": "Chatbots fetched successfully",
                },
                status=200,
            )
        except Exception as e:
            logger.error(f"Error fetching chatbots: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Unable to fetch chatbots. Please try again.",
                },
                status=500,
            )

    def post(self, request):
        try:
            with transaction.atomic():
                # Create chatbot object
                chatbot = Chatbot.objects.create(
                    organization=request.user.organization,
                    name=request.data.get("chatbotName"),
                    initial_message=request.data.get("initialMessage"),
                    primary_color=request.data.get("primaryColor"),
                    secondary_color=request.data.get("secondaryColor"),
                    chatbot_border_radius=request.data.get("chatbotBorderRadius"),
                    font_size=request.data.get("fontSize"),
                    widget_color=request.data.get("widgetColor"),
                    widget_border_radius=request.data.get("widgetBorderRadius"),
                    chatbot_type=request.data.get("chatbotType"),
                    status="training",
                )

                training_method = request.data.get("trainingMethod")
                file_contents = None
                urls = None

                if training_method == "files":
                    files = request.FILES.getlist("files")
                    file_contents = []
                    for file in files:
                        # Read as bytes and encode to base64 for safe serialization
                        content = base64.b64encode(file.read()).decode("utf-8")
                        file_contents.append(
                            {
                                "name": file.name,
                                "content": content,
                                "content_type": file.content_type,
                            }
                        )
                elif training_method == "urls":
                    urls = request.data.getlist("urls")

                try:
                    logger.info(
                        f"Attempting to create Celery task for chatbot {chatbot.id}"
                    )
                    train_chatbot_task.delay(
                        str(chatbot.id),
                        training_method,
                        file_contents=file_contents,
                        urls=urls,
                    )
                    logger.info("Celery task created successfully")
                except Exception as task_error:
                    logger.error(f"Failed to create Celery task: {str(task_error)}")
                    raise

                return Response(
                    {
                        "message": "Chatbot creation initiated. Training in progress.",
                        "chatbotId": str(chatbot.id),
                    },
                    status=202,
                )

        except Exception as e:
            logger.error(f"Error creating chatbot: {str(e)}")
            return Response(
                {"error": "There was an error creating the chatbot."}, status=500
            )


class ChatbotEmbedScriptView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, embed_id):
        try:
            chatbot = get_object_or_404(Chatbot, embed_id=embed_id)

            # Get the base URL and WebSocket URL
            base_url = request.build_absolute_uri("/").rstrip("/")
            ws_protocol = "wss" if request.is_secure() else "ws"
            ws_host = request.get_host()

            # Change this line to only provide the base WebSocket URL
            ws_url = f"{ws_protocol}://{ws_host}"  # Remove the /ws/chat/{chatbot.embed_id}/ part

            # Render the JavaScript template
            script = render_to_string(
                "chatbots/embed.js",
                {
                    "chatbot": chatbot,
                    "base_url": base_url,
                    "ws_url": ws_url,
                },
            )

            return HttpResponse(
                script,
                content_type="application/javascript; charset=utf-8",
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                },
            )
        except Exception as e:
            logger.error(f"Failed to load chatbot script: {str(e)}")
            return HttpResponse(
                f"console.error('Failed to load chatbot script: {str(e)}');",
                content_type="application/javascript",
                status=500,
            )


class ChatbotDetailView(APIView):
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    def get(self, request, chatbot_id):
        try:
            chatbot = get_object_or_404(Chatbot, id=chatbot_id)
            serializer = ChatbotDetailSerializer(chatbot)
            embed_code = f"<script src='{request.build_absolute_uri('/api/chatbots/embed/')}{chatbot.embed_id}.js'></script>"
            data = serializer.data
            data["embedCode"] = embed_code
            return Response(data, status=200)
        except Exception as e:
            logger.error(f"Error fetching chatbot: {str(e)}")
            return Response(
                {"error": "There was an error fetching the chatbot."}, status=500
            )

    def delete(self, request, chatbot_id):
        try:
            chatbot = get_object_or_404(Chatbot, id=chatbot_id)
            chatbot.delete()
            return Response(status=204)
        except Exception as e:
            logger.error(f"Error deleting chatbot: {str(e)}")
            return Response(
                {"error": "There was an error deleting the chatbot."}, status=500
            )


class ChatbotSSEView(APIView):
    permission_classes = [AllowAny]
    renderer_classes = [EventStreamRenderer]
    chat_consumers = {}  # Class-level dictionary to store consumer instances

    async def get_or_create_consumer(self, chatbot_id, email, initialize=False):
        consumer_key = f"{chatbot_id}_{email}"
        if consumer_key not in self.chat_consumers:
            if not initialize:
                raise ValueError("Consumer not initialized. Please refresh the page.")
            print(f"Creating new consumer for chatbot_id: {chatbot_id}")
            consumer = InternalChatConsumer(chatbot_id, email)
            await consumer.initialize()
            self.chat_consumers[consumer_key] = consumer
        else:
            print(f"Using existing consumer for chatbot_id: {chatbot_id}")
        return self.chat_consumers[consumer_key]

    def get(self, request, chatbot_id):
        """Handle SSE stream connection and initial consumer setup"""
        print(f"\n=== SSE GET Request for chatbot {chatbot_id} ===")
        email = (
            request.user.email if request.user.is_authenticated else "admin@test.com"
        )

        # Initialize consumer on SSE connection
        consumer = async_to_sync(self.get_or_create_consumer)(
            chatbot_id, email, initialize=True
        )

        async def event_stream():
            try:
                # Send initial connection confirmation
                yield f"data: {json.dumps({'type': 'connected'})}\n\n"
                print("SSE Connection established")

                while True:
                    await asyncio.sleep(30)  # Keepalive ping every 30 seconds
                    yield f"data: {json.dumps({'type': 'ping'})}\n\n"

            except Exception as e:
                print(f"Stream error: {str(e)}")

        response = StreamingHttpResponse(
            event_stream(), content_type="text/event-stream"
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response

    def post(self, request, chatbot_id):
        """Handle chat messages using existing consumer"""
        try:
            query = request.data.get("query")
            email = request.user.email if request.user.is_authenticated else "admin@test.com"

            # Get existing consumer
            consumer = async_to_sync(self.get_or_create_consumer)(
                chatbot_id, email, initialize=False
            )

            def generate():
                # Create a new event loop for async operations
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                async def get_chunks():
                    async for chunk_data in consumer.get_response(query):
                        yield f"data: {json.dumps(chunk_data)}\n\n"
                
                try:
                    # Run the async generator in the event loop
                    for chunk in loop.run_until_complete(self._collect_chunks(get_chunks())):
                        yield chunk
                finally:
                    loop.close()

            return StreamingHttpResponse(
                streaming_content=generate(),
                content_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                }
            )

        except Exception as e:
            logger.error(f"Error in post: {str(e)}")
            return Response({"error": str(e)}, status=500)

    async def _collect_chunks(self, generator):
        """Helper method to collect chunks from an async generator"""
        chunks = []
        async for chunk in generator:
            chunks.append(chunk)
        return chunks
