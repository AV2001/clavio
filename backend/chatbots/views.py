from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .train import train_chatbot


class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(request.data)
        name = request.data.get("name")
        files = request.FILES.getlist("files")

        # pass the name and files to the train.py file
        file = train_chatbot(name, files)
        # return the response

        # print(files)
        return Response({"message": "Hello, World!"})
