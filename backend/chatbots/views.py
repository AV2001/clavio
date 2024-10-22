import logging
from io import BytesIO
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .train import train_chatbot, get_chatbot_response
from .models import Chatbot

logger = logging.getLogger(__name__)


class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            chatbot_name = request.data.get("chatbotName")
            initial_message = request.data.get("initialMessage")
            color = request.data.get("color")
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
                name=chatbot_name,
                initial_message=initial_message,
                color=color,
                organization=request.user.organization,
            )
            chatbot.save()
            return Response(
                {
                    "message": response["message"],
                },
                status=response["status"],
            )
        except Exception as e:
            logger.error(f"Error creating chatbot: {str(e)}")
            return Response(
                {"error": "There was an error creating the chatbot. Please try again."},
                status=500,
            )


class ChatbotQueryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            question = request.data.get("question")
            response = get_chatbot_response(question)
            return Response({"response": response})
        except Exception as e:
            logger.error(f"Error processing chatbot query: {str(e)}")
            return Response(
                {"error": "There was an error processing your question. Please try again."},
                status=500
            )
