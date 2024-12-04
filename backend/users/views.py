import logging
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .utils import send_invite_email
from .models import User, TeamInvite
from organizations.models import Organization


logger = logging.getLogger(__name__)


class UserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            full_name = request.data.get("fullName")
            email = request.data.get("email")
            password = request.data.get("password")

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

            # Check if the email has a valid invitation
            invite = TeamInvite.objects.filter(
                email=email, accepted_invite=False
            ).first()

            if invite:
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
                # Create admin user
                admin_user = User.objects.create(
                    full_name=full_name, email=email, password=password, is_admin=True
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
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            email = request.query_params.get("email")
            user = User.objects.get(email=email)

            if not user:
                return Response({"error": "User not found."}, status=404)

            user_data = {
                "email": user.email,
                "id": user.id,
                "name": user.full_name,
                "needsOnboarding": user.needs_onboarding,
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


class InviteTeamMemberView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # if not request.user.is_admin:
            #     return Response(
            #         {
            #             "success": False,
            #             "message": "You are not authorized to invite team members.",
            #         },
            #         status=403,
            #     )

            email = request.data.get("email")
            if not email:
                return Response(
                    {"success": False, "message": "Email is required."}, status=400
                )

            # Check if invitation already exists
            organization = Organization.objects.get(
                id="4e02db5b-7bc9-4e91-b5d0-e4a97d92b41d"
            )
            existing_invite = TeamInvite.objects.filter(
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
            user = User.objects.get(email="admin@test.com")
            invite = TeamInvite.objects.create(
                email=email,
                organization=organization,
                invited_by=user,
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
