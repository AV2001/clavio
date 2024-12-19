from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import stripe
from django.conf import settings
from .models import Subscriptions, OrganizationSubscription
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.views.decorators.http import require_POST
import logging
import os
from .handlers import (
    handle_subscription_updated,
    handle_subscription_deleted,
    handle_checkout_session_completed,
    handle_invoice_paid,
    handle_invoice_payment_failed,
    update_subscription_seat_count,
)
from rest_framework.decorators import api_view, permission_classes

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
logger = logging.getLogger(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL")


class CreateCheckoutSession(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            plan_name = request.data.get("plan")["name"]
            print(f"Looking for plan with name: {plan_name}")

            # Get the plan from database using the name
            plan = Subscriptions.objects.get(name=plan_name.lower())
            print(f"Found plan: {plan.name} with price_id: {plan.price_id}")

            # Get the organization ID from the authenticated user
            organization_id = "d7f531d3-d345-4dd3-b978-503d8e71f7d6"  # Adjust based on your user model

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price": plan.price_id,
                    "quantity": 1,
                }],
                mode="subscription",
                success_url=f"{FRONTEND_URL}/settings",
                cancel_url=f"{FRONTEND_URL}/settings",
                client_reference_id=organization_id,
                subscription_data={
                    "metadata": {
                        "organization_id": organization_id,
                        "plan_name": plan.name
                    }
                },
            )

            # Create or update the organization subscription
            print(f"Creating/updating organization subscription with org_id: {organization_id}")
            
            org_subscription, created = OrganizationSubscription.objects.update_or_create(
                organization_id=organization_id,
                defaults={
                    'stripe_subscription_id': checkout_session.subscription,
                    'subscription_status': 'incomplete',  # Will be updated by webhook when payment completes
                    'subscription': plan,
                }
            )
            
            print(f"Organization subscription {'created' if created else 'updated'}: {org_subscription.id}")
            print(f"Full org subscription data: {vars(org_subscription)}")

            logger.info(f"Checkout session created: {checkout_session.id} for organization {organization_id}")
            return Response({
                "sessionId": checkout_session.id
            })

        except Subscriptions.DoesNotExist:
            logger.error(f"Subscription plan not found: {plan_name}")
            return Response({"error": "Invalid subscription plan"}, status=400)
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return Response({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META["HTTP_STRIPE_SIGNATURE"]
    event = None

    try:
        print("=== Webhook received ===")
        print(f"Webhook Type: {request.headers.get('Stripe-Event-Type')}")
        
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            os.getenv("STRIPE_WEBHOOK_SECRET"),
        )
        
        print(f"Event constructed: {event.type}")

        # Handle the webhook events
        if event.type == "customer.subscription.updated":
            print("Handling subscription updated")
            handle_subscription_updated(event.data.object)
        elif event.type == "customer.subscription.deleted":
            print("Handling subscription deleted")
            handle_subscription_deleted(event.data.object)
        elif event.type == "checkout.session.completed":
            print("Handling checkout session completed")
            handle_checkout_session_completed(event.data.object)
        elif event.type == "invoice.paid":
            print("Handling invoice paid")
            handle_invoice_paid(event.data.object)
        elif event.type == "invoice.payment_failed":
            print("Handling invoice payment failed")
            handle_invoice_payment_failed(event.data.object)
        else:
            print(f"Unhandled event type: {event.type}")

        return HttpResponse(status=200)

    except ValueError as e:
        print(f"Error parsing webhook payload: {str(e)}")
        logger.error(f"Invalid stripe webhook payload: {str(e)}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        print(f"Error verifying webhook signature: {str(e)}")
        logger.error(f"Invalid stripe webhook signature: {str(e)}")
        return HttpResponse(status=400)
    except Exception as e:
        print(f"Unexpected webhook error: {str(e)}")
        logger.error(f"Webhook error: {str(e)}")
        return HttpResponse(status=400)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_subscription(request):
    try:
        # Get any subscription (not filtering by user)
        org_subscription = OrganizationSubscription.objects.first()
        if org_subscription:
            return Response(
                {
                    "status": org_subscription.subscription_status,
                    "current_period_end": org_subscription.subscription_end_date.isoformat()
                    if org_subscription.subscription_end_date
                    else None,
                }
            )
        return Response(
            {
                "status": "inactive",
                "current_period_end": None,
            }
        )
    except Exception as e:
        logger.error(f"Error fetching subscription: {str(e)}")
        return Response({"error": "Failed to fetch subscription"}, status=500)


@api_view(["POST"])
def update_seats(request):
    """
    Update seat count in Stripe based on organization members

    POST /api/subscriptions/update-seats/
    {
        "seat_count": 5  # Optional: if not provided, defaults to 5
    }
    """
    try:
        # Hardcoded organization_id for testing
        organization_id = "d7f531d3-d345-4dd3-b978-503d8e71f7d6"  # Replace with an actual UUID from your database

        # Get seat count from request or use default
        seat_count = request.data.get("seat_count", 5)

        # Update subscription seat count
        update_subscription_seat_count(organization_id, seat_count)

        return Response(
            {
                "success": True,
                "organization_id": organization_id,
                "seat_count": seat_count,
            }
        )
    except Exception as e:
        logger.error(f"Error updating seats: {str(e)}")
        return Response({"error": str(e)}, status=400)
