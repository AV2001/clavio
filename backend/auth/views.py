from django.contrib.auth import get_user_model
from django.middleware import csrf
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
import logging


User = get_user_model()
logger = logging.getLogger(__name__)


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
                "message": "Login successful!",
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


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            # Validate content type
            if (
                not request.content_type
                or "application/json" not in request.content_type.lower()
            ):
                return Response(
                    {"error": "Invalid content type. Expected application/json"},
                    status=400,
                )

            refresh = request.data.get("refresh")
            if not refresh:
                return Response(
                    {"error": "No refresh token provided"},
                    status=400,
                )

            # Enhanced error handling
            serializer = self.get_serializer(data=request.data)

            try:
                serializer.is_valid(raise_exception=True)
            except TokenError as e:
                logger.warning(f"Token refresh failed: {str(e)}")
                return Response(
                    {
                        "error": "Token refresh failed. Please login again.",
                        "code": "token_refresh_failed",
                    },
                    status=401,
                )

            validated_data = serializer.validated_data

            logger.info("Token refresh successful")
            return Response(
                {
                    "access": validated_data["access"],
                    "refresh": validated_data["refresh"],
                },
                status=200,
            )

        except Exception as e:
            logger.error(f"Unexpected token refresh error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred", "code": "unexpected_error"},
                status=500,
            )
