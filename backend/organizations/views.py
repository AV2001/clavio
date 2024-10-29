# org views.py 
import logging
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
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
                return Response({"error": "An organization with this name already exists."}, status=400)

            new_organization = Organization.objects.create(
                name=name
            )
            new_organization.save()

            return Response(
                {
                    "error": "Organization created successfully.",
                    "id": str(new_organization.id)
                },
                status=201,
            )

        except Exception as e:
            logger.error(f"Error creating organization: {str(e)}")
            return Response(
                {"error": "Organization could not be created. Please try again."},
                status=500,
            )
