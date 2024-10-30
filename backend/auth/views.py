from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from datetime import datetime
from django.conf import settings

User = get_user_model()


class TokenObtainView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get("email")
            if not email:
                return Response({"error": "Email is required"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {
                        "error": "No account found with this email address. Please register first."
                    },
                    status=404,
                )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            response = Response({"message": "Login successful"})
            
            # Set cookies
            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                httponly=True,
                secure=True,  # Only send over HTTPS
                samesite='Lax',
                expires=datetime.now() + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
            )
            
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=True,  # Only send over HTTPS
                samesite='Lax',
                expires=datetime.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
            )

            return response

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response