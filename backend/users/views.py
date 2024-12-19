import logging
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from uuid import uuid4
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
            invite_token = request.data.get("inviteToken")

            if not full_name or not email:
                return Response(
                    {"success": False, "message": "Missing required fields."},
                    status=400,
                )

            # For invite flow, check if there's a valid invitation
            if is_invite:
                try:
                    invited_user = User.objects.get(
                        email=email, accepted_invite=False, invite_token__isnull=False
                    )

                    # Verify the invite token matches
                    if str(invited_user.invite_token) != invite_token:
                        return Response(
                            {
                                "success": False,
                                "message": "Invalid invitation token for this email address.",
                            },
                            status=400,
                        )

                    # Check if user already exists with accepted invite
                    if User.objects.filter(email=email, accepted_invite=True).exists():
                        return Response(
                            {
                                "success": False,
                                "message": "This email is already associated with an account.",
                            },
                            status=400,
                        )

                except User.DoesNotExist:
                    return Response(
                        {
                            "success": False,
                            "message": "No valid invitation found for this email address.",
                        },
                        status=400,
                    )

            if User.objects.filter(email=email, accepted_invite=True).exists():
                return Response(
                    {
                        "success": False,
                        "message": "This email is already in use.",
                    },
                    status=400,
                )

            # For admin signup (non-invite flow)
            if not is_invite:
                if not organization_name:
                    return Response(
                        {"success": False, "message": "Organization name is required."},
                        status=400,
                    )

                if Organization.objects.filter(name=organization_name).exists():
                    return Response(
                        {
                            "success": False,
                            "message": "An organization with this name already exists.",
                        },
                        status=400,
                    )

                organization = Organization.objects.create(name=organization_name)
                organization.save()

                admin_user = User.objects.create(
                    full_name=full_name,
                    email=email,
                    password=password,
                    is_admin=True,
                    organization=organization,
                )
                admin_user.save()
            else:
                # Update the existing invited user
                invited_user.full_name = full_name
                invited_user.password = password
                invited_user.accepted_invite = True
                invited_user.invite_token = None
                invited_user.save()

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
            email = request.data.get("email")
            if not email:
                return Response(
                    {"success": False, "message": "Email is required."}, status=400
                )

            # Check if user already exists and has accepted an invite
            if User.objects.filter(email=email, accepted_invite=True).exists():
                return Response(
                    {
                        "success": False,
                        "message": "This user is already a member of an organization.",
                    },
                    status=400,
                )

            # Check if there's a pending invite for this email
            existing_user = User.objects.filter(
                email=email, accepted_invite=False
            ).first()

            if existing_user:
                return Response(
                    {
                        "success": False,
                        "message": "An invitation is already pending for this email.",
                    },
                    status=400,
                )

            # Generate invite token
            invite_token = uuid4()

            # Create new user with pending invite
            new_user = User.objects.create(
                email=email,
                organization=request.user.organization,
                invite_token=invite_token,
                accepted_invite=False,
                is_admin=False,
            )

            new_user.save()

            # Send invite email
            send_invite_email(
                from_email="noreply@tryquizr.com",
                to_email=email,
                organization_name=request.user.organization.name,
                invite_token=invite_token,
            )

            return Response(
                {"success": True, "message": "Invitation sent successfully."},
                status=200,
            )

        except Exception as e:
            logger.error(f"Error inviting team member: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Failed to send invitation. Please try again.",
                },
                status=500,
            )
