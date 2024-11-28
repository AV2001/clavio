import logging
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from users.models import User
from .models import Organization

logger = logging.getLogger(__name__)


class OrganizationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            name = request.data.get("name")

            if not name:
                return Response({"error": "Organization name is required."}, status=400)

            if Organization.objects.filter(name=name).exists():
                return Response(
                    {"error": "An organization with this name already exists."},
                    status=400,
                )

            # Create the new organization
            new_organization = Organization.objects.create(name=name)
            new_organization.save()

            # Update the user's organization and needs_onboarding
            user = User.objects.get(id=request.user.id)
            user.needs_onboarding = False
            user.organization = new_organization
            user.save()

            return Response(
                {
                    "message": "Organization created successfully.",
                    "id": str(new_organization.id),
                },
                status=201,
            )

        except Exception as e:
            logger.error(f"Error creating organization: {str(e)}")
            return Response(
                {"error": "Organization could not be created. Please try again."},
                status=500,
            )


class OrganizationDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            organization = Organization.objects.all()[0]
            user = User.objects.get(id=request.user.id)
            print(user)

            return Response({"data": organization.name}, status=200)
        except Exception as e:
            logger.error(f"Error getting organization: {str(e)}")
            return Response(
                {"error": "Organization could not be retrieved. Please try again."},
                status=500,
            )
