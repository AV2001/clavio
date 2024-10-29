import logging
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import User

logger = logging.getLogger(__name__)


class UserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            full_name = request.data.get("fullName")
            email = request.data.get("email")
            password = request.data.get("password")
            print(type(request.data))
            print(request.data)
            print(full_name, email, password)

            if not full_name or not email:
                return Response({"error": "Missing required fields."}, status=400)

            if User.objects.filter(email=email).exists():
                return Response({"error": "This email already exists."}, status=400)

            user = User.objects.create(
                full_name=full_name,
                email=email,
                password=password,
            )
            user.save()

            return Response(
                {
                    "message": "User created successfully.",
                },
                status=201,
            )

        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response(
                {"error": "Your account could not be created. Please try again."},
                status=500,
            )


class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            email = request.data.get("email")
            user = User.objects.filter(email=email).first()
            user_data = {
                "email": user.email,
                "id": user.id,
                "name": user.full_name,
            }
            return Response(
                {"data": user_data},
                status=200,
            )
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return Response(
                {"error": "User could not be retrieved. Please try again."}, status=500
            )
