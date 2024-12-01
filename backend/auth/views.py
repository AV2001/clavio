from django.contrib.auth import get_user_model
from django.middleware import csrf
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny


User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=400,
            )

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password"},
                status=401,
            )

        tokens = get_tokens_for_user(user)
        csrf_token = csrf.get_token(request)

        return Response(
            {
                "message": "Login successful",
                "tokens": {
                    **tokens,
                    "csrf": csrf_token,
                },
                "user": user.id,
                "fullName": user.full_name,
                "email": user.email,
                "isAdmin": user.is_admin,
            }
        )
