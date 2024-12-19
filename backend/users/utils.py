import resend
from backend.settings.base import FRONTEND_URL, RESEND_API_KEY
import logging


logger = logging.getLogger(__name__)


def send_invite_email(from_email, to_email, organization_name):
    try:
        resend.api_key = RESEND_API_KEY
        signup_url = f"{FRONTEND_URL}/signup?type=invite"

        params: resend.Emails.SendParams = {
            "from": from_email,
            "to": [to_email],
            "subject": f"Invitation to join {organization_name}!",
            "html": f"""
                You've been invited to join <strong>{organization_name}</strong>!
                <br><br>
                <a href="{signup_url}">Click here to accept the invitation</a>
            """,
        }

        resend.Emails.send(params)
    except Exception as e:
        logger.error(f"Error sending invite email: {str(e)}")
        raise e
