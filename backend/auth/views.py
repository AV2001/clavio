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
from subscriptions.models import OrganizationSubscription


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

        # Get subscription info
        org_subscription = OrganizationSubscription.objects.filter(
            organization=user.organization
        ).first()

        subscription_data = None
        if org_subscription and org_subscription.subscription:
            subscription_plan = org_subscription.subscription
            subscription_data = {
                "status": org_subscription.subscription_status,
                "current_period_end": org_subscription.subscription_end_date,
                "plan": {
                    "id": subscription_plan.id,
                    "name": subscription_plan.name,
                    "max_chatbots": subscription_plan.max_chatbots,
                    "max_pdfs": subscription_plan.max_pdfs,
                    "max_pages_per_pdfs": subscription_plan.max_pages_per_pdfs,
                    "max_url_links": subscription_plan.max_url_links,
                    "max_prompts_per_day": subscription_plan.max_prompts_per_day,
                    "max_retrains_per_month": subscription_plan.max_retrains_per_month,
                },
            }

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
                "subscription": subscription_data,
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
