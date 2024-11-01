import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from organizations.models import Organization
from .serializers import ChatbotSerializer
from .models import Chatbot
from .tasks import train_chatbot_task


logger = logging.getLogger(__name__)


class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            chatbots = Chatbot.objects.filter(
                organization="7c994c28-6d35-42df-a722-887a86659d8b"
            )
            serializer = ChatbotSerializer(chatbots, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            logger.error(f"Error fetching chatbots: {str(e)}")
            return Response(
                {
                    "error": "There was an error fetching the chatbots. Please try again later."
                },
                status=500,
            )

    def post(self, request):
        try:
            with transaction.atomic():
                # Log the incoming request data
                logger.info(f"Received request data: {request.data}")

                chatbot = Chatbot.objects.create(
                    organization=Organization.objects.get(
                        id="7c994c28-6d35-42df-a722-887a86659d8b"
                    ),
                    name=request.data.get("chatbotName"),
                    initial_message=request.data.get("initialMessage"),
                    primary_color=request.data.get("primaryColor"),
                    secondary_color=request.data.get("secondaryColor"),
                    chatbot_border_radius=request.data.get("borderRadius"),
                    font_size=request.data.get("fontSize"),
                    widget_color=request.data.get("widgetColor"),
                    status="training",
                )

                # Log successful chatbot creation
                logger.info(f"Created chatbot with ID: {chatbot.id}")

                training_method = request.data.get("trainingMethod")
                files = (
                    request.FILES.getlist("files")
                    if training_method == "files"
                    else None
                )
                urls = (
                    request.data.getlist("urls") if training_method == "urls" else None
                )

                try:
                    # Log task creation attempt
                    logger.info(
                        f"Attempting to create Celery task for chatbot {chatbot.id}"
                    )

                    train_chatbot_task.delay(
                        str(chatbot.id), training_method, files=files, urls=urls
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
            ws_url = f"{ws_protocol}://{request.get_host()}/ws/chat/{chatbot.embed_id}/"

            # Render the JavaScript template
            script = render_to_string(
                "chatbots/embed.js",
                {
                    "chatbot": chatbot,
                    "base_url": base_url,
                    "ws_url": ws_url,
                },
            )

            # Return as a proper JavaScript response
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
    permission_classes = [AllowAny]

    def get(self, request, chatbot_id):
        try:
            chatbot = get_object_or_404(Chatbot, id=chatbot_id)
            serializer = ChatbotSerializer(chatbot)
            embed_code = f"<script src='{request.build_absolute_uri('/api/chatbots/embed/')}{chatbot.embed_id}.js'></script>"
            data = serializer.data
            data["embedCode"] = embed_code
            return Response(data, status=200)
        except Exception as e:
            logger.error(f"Error fetching chatbot: {str(e)}")
            return Response(
                {"error": "There was an error fetching the chatbot."}, status=500
            )
