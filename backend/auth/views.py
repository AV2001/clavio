from django.contrib.auth import get_user_model
from django.middleware import csrf
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
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
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        response = Response()
        email = request.data.get("email")
        user = authenticate(email=email)

        if user is not None:
            if user.is_active:
                tokens = get_tokens_for_user(user)
                csrf_token = csrf.get_token(request)

                response.data = {
                    "message": "Login successfully",
                    "tokens": {
                        **tokens,
                        "csrf": csrf_token,
                    },
                }
                return response
            else:
                return Response(
                    {"error": "This account is not active!!"},
                    status=404,
                )
        else:
            return Response(
                {"error": "Invalid username or password!!"},
                status=404,
            )
