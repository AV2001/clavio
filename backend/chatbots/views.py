from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .train import train_chatbot, get_chatbot_response
from io import BytesIO


class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        files = request.FILES.getlist("files")

        if not files:
            return Response({"error": "No files uploaded"}, status=400)

        # Process files directly from memory
        file_contents = []
        for file in files:
            content = file.read()
            file_contents.append((file.name, BytesIO(content)))

        response = train_chatbot(file_contents)

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
