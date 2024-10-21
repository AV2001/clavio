from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .train import train_chatbot, get_chatbot_response
import os
from django.conf import settings


class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(request.data)
        name = request.data.get("name")
        files = request.FILES.getlist("files")

        # Get the file paths for the uploaded files
        if files:
            file_paths = []
            for file in files:
                file_path = os.path.join(settings.MEDIA_ROOT, file.name)
                with open(file_path, "wb+") as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                file_paths.append(file_path)
        else:
            return Response({"error": "No files uploaded"}, status=400)

        response = train_chatbot(file_paths)

        # return the response from train_chatbot
        return Response(
            {
                "message": response["message"],
            },
            status=response["status"],
        )


class ChatbotQueryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        question = request.data.get("question")
        response = get_chatbot_response(question)
        return Response({"response": response})
