import logging
from io import BytesIO
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .train import train_chatbot
from organizations.models import Organization
from .models import Chatbot


logger = logging.getLogger(__name__)


class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            chatbot_name = request.data.get("chatbotName")
            initial_message = request.data.get("initialMessage")
            bot_image = request.data.get("botImage")
            primary_color = request.data.get("primaryColor")
            secondary_color = request.data.get("secondaryColor")
            chatbot_border_radius = request.data.get("borderRadius")
            font_size = request.data.get("fontSize")
            widget_color = request.data.get("widgetColor")
            widget_border_radius = request.data.get("widgetBorderRadius")
            files = request.FILES.getlist("files")

            if not files:
                return Response({"error": "No files uploaded"}, status=400)

            # Process files directly from memory
            file_contents = []
            for file in files:
                content = file.read()
                file_contents.append((file.name, BytesIO(content)))

            response = train_chatbot(file_contents)
            chatbot = Chatbot.objects.create(
                organization=Organization.objects.get(
                    id="7c994c28-6d35-42df-a722-887a86659d8b"
                ),
                name=chatbot_name,
                initial_message=initial_message,
                primary_color=primary_color,
                secondary_color=secondary_color,
                chatbot_border_radius=chatbot_border_radius,
                font_size=font_size,
                widget_color=widget_color,
                widget_border_radius=widget_border_radius,
            )
            chatbot.save()

            embed_url = f"{request.build_absolute_uri('/embed/')}{chatbot.embed_id}"

            return Response(
                {
                    "message": response["message"],
                    "embed_url": embed_url,
                },
                status=response["status"],
            )
        except Exception as e:
            logger.error(f"Error creating chatbot: {str(e)}")
            return Response(
                {
                    "error": "There was an error creating the chatbot. Please try again later."
                },
                status=500,
            )
