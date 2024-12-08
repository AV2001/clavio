import logging
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .utils import send_invite_email
from .models import User
from organizations.models import Organization
from .serializers import UserSerializer


logger = logging.getLogger(__name__)


class UserView(APIView):
    permission_classes = [AllowAny]
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            users = User.objects.filter(organization=request.user.organization)
            serializer = UserSerializer(users, many=True)
            return Response(
                {
                    "success": True,
                    "users": serializer.data,
                    "message": "Users fetched successfully!",
                },
                status=200,
            )
        except Exception as e:
            logger.error(f"Error getting users: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Could not fetch users. Please try again.",
                },
                status=500,
            )

    def post(self, request):
        try:
            full_name = request.data.get("fullName")
            email = request.data.get("email")
            password = request.data.get("password")
            is_invite = request.data.get("isInvite") == "true"
            organization_name = request.data.get("organizationName")

            if not full_name or not email:
                return Response(
                    {"success": False, "message": "Missing required fields."},
                    status=400,
                )

            if User.objects.filter(email=email).exists():
                return Response(
                    {"success": False, "message": "This email already exists."},
                    status=400,
                )

            # If user is trying to sign up through an invitation link
            if is_invite:
                invite = User.objects.filter(email=email, accepted_invite=False).first()

                if not invite:
                    return Response(
                        {
                            "success": False,
                            "message": "No invitation found for this email. Please check with your organization administrator.",
                        },
                        status=400,
                    )

                # Create non-admin user in the invited organization
                non_admin_user = User.objects.create(
                    full_name=full_name,
                    email=email,
                    password=password,
                    is_admin=False,
                    organization=invite.organization,
                )
                non_admin_user.save()

                # Mark the invitation as accepted
                invite.accepted_invite = True
                invite.save()

            else:
                # For admin signup, organization name is required
                if not organization_name:
                    return Response(
                        {"success": False, "message": "Organization name is required."},
                        status=400,
                    )

                # Check if organization name already exists
                if Organization.objects.filter(name=organization_name).exists():
                    return Response(
                        {
                            "success": False,
                            "message": "An organization with this name already exists.",
                        },
                        status=400,
                    )

                # Create organization first
                organization = Organization.objects.create(name=organization_name)
                organization.save()
                # Create admin user with organization
                admin_user = User.objects.create(
                    full_name=full_name,
                    email=email,
                    password=password,
                    is_admin=True,
                    organization=organization,
                )
                admin_user.save()
            return Response(
                {"success": True, "message": "Account created successfully."},
                status=201,
            )

        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Your account could not be created. Please try again.",
                },
                status=500,
            )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            organization = Organization.objects.get(id=request.user.organization.id)
            user = User.objects.get(id=user_id, organization=organization)
            user.delete()
            return Response(
                {"success": True, "message": "User deleted successfully."},
                status=200,
            )
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found."},
                status=404,
            )
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "User could not be deleted. Please try again.",
                },
                status=500,
            )


class InviteTeamMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if not request.user.is_admin:
                return Response(
                    {
                        "success": False,
                        "message": "You are not authorized to invite team members.",
                    },
                    status=403,
                )

            email = request.data.get("email")
            if not email:
                return Response(
                    {"success": False, "message": "Email is required."}, status=400
                )

            # Check if invitation already exists
            organization = Organization.objects.get(id=request.user.organization.id)
            existing_invite = User.objects.filter(
                email=email, organization=organization, accepted_invite=False
            ).first()

            if existing_invite:
                return Response(
                    {"success": False, "message": "Invitation already sent."},
                    status=400,
                )

            # Send invite email
            send_invite_email(
                from_email="admin@tryquizr.com",
                to_email=email,
                organization_name=organization.name,
            )

            # Create new invitation
            invite = User.objects.create(
                email=email,
                organization=organization,
                accepted_invite=False,
            )
            invite.save()

            return Response(
                {"success": True, "message": f"Invitation sent to {email}!"},
                status=201,
            )
        except Exception as e:
            logger.error(f"Error inviting team member: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Team member could not be invited. Please try again.",
                },
                status=500,
            )
