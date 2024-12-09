import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from .serializers import ChatbotListSerializer, ChatbotDetailSerializer
from .models import Chatbot
from .tasks import train_chatbot_task
import base64


logger = logging.getLogger(__name__)


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
