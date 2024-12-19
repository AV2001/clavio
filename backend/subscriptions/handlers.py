import logging
from django.utils import timezone
from .models import OrganizationSubscription, Subscriptions
import stripe
import os

logger = logging.getLogger(__name__)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


def handle_subscription_updated(subscription_object):
    """
    Handle when a subscription is updated in Stripe
    """
    try:
        # Get the organization subscription from our database
        org_subscription = OrganizationSubscription.objects.get(
            stripe_subscription_id=subscription_object.id
        )

        # Update subscription details
        org_subscription.subscription_status = subscription_object.status
        org_subscription.subscription_end_date = timezone.datetime.fromtimestamp(
            subscription_object.current_period_end
        )
        org_subscription.save()

        logger.info(
            f"Organization subscription {org_subscription.id} updated successfully"
        )
    except OrganizationSubscription.DoesNotExist:
        logger.error(
            f"Organization subscription with Stripe ID {subscription_object.id} not found"
        )
    except Exception as e:
        logger.error(f"Error handling subscription update: {str(e)}")


def handle_subscription_deleted(subscription_object):
    """
    Handle when a subscription is cancelled in Stripe
    """
    try:
        org_subscription = OrganizationSubscription.objects.get(
            stripe_subscription_id=subscription_object.id
        )
        org_subscription.subscription_status = "canceled"
        org_subscription.save()

        logger.info(
            f"Organization subscription {org_subscription.id} marked as canceled"
        )
    except OrganizationSubscription.DoesNotExist:
        logger.error(
            f"Organization subscription with Stripe ID {subscription_object.id} not found"
        )
    except Exception as e:
        logger.error(f"Error handling subscription deletion: {str(e)}")


def handle_checkout_session_completed(session):
    """
    Handle successful checkout session completion
    """
    try:
        # Get the subscription details from Stripe
        stripe_subscription = stripe.Subscription.retrieve(session.subscription)
        
        # Update the organization subscription status
        org_subscription = OrganizationSubscription.objects.get(
            organization_id=session.client_reference_id
        )
        org_subscription.subscription_status = stripe_subscription.status
        org_subscription.subscription_end_date = timezone.datetime.fromtimestamp(
            stripe_subscription.current_period_end
        )
        org_subscription.stripe_subscription_item_id = stripe_subscription.items.data[0].id
        org_subscription.save()
        
        logger.info(f"Updated organization subscription status: {org_subscription.id}")
        return org_subscription

    except Exception as e:
        logger.error(f"Error handling checkout completion: {str(e)}")
        raise


def handle_invoice_paid(invoice):
    """
    Handle successful invoice payment
    """
    try:
        org_subscription = OrganizationSubscription.objects.get(
            stripe_subscription_id=invoice.subscription
        )
        org_subscription.subscription_end_date = timezone.datetime.fromtimestamp(
            invoice.lines.data[0].period.end
        )
        org_subscription.subscription_status = "active"
        org_subscription.save()

        logger.info(f"Invoice paid for organization subscription {org_subscription.id}")
    except OrganizationSubscription.DoesNotExist:
        logger.error(
            f"Organization subscription with Stripe ID {invoice.subscription} not found"
        )
    except Exception as e:
        logger.error(f"Error handling invoice payment: {str(e)}")


def handle_invoice_payment_failed(invoice):
    """
    Handle failed invoice payment
    """
    try:
        org_subscription = OrganizationSubscription.objects.get(
            stripe_subscription_id=invoice.subscription
        )
        org_subscription.subscription_status = "past_due"
        org_subscription.save()

        logger.info(
            f"Invoice payment failed for organization subscription {org_subscription.id}"
        )
    except OrganizationSubscription.DoesNotExist:
        logger.error(
            f"Organization subscription with Stripe ID {invoice.subscription} not found"
        )
    except Exception as e:
        logger.error(f"Error handling invoice payment failure: {str(e)}")


def update_subscription_seat_count(subscription_object, seat_count):
    """
    Update the seat count for a subscription with proration
    """
    try:
        # First update the subscription in Stripe with proration
        stripe_subscription = stripe.Subscription.modify(
            subscription_object.id,
            items=[
                {
                    "id": subscription_object.items.data[
                        0
                    ].id,  # Assumes one item/price in subscription
                    "quantity": seat_count,
                }
            ],
            proration_behavior="create_prorations",
        )

        # Then update our local database
        org_subscription = OrganizationSubscription.objects.get(
            stripe_subscription_id=subscription_object.id
        )
        org_subscription.seat_count = seat_count
        org_subscription.save()

        logger.info(
            f"Updated seat count to {seat_count} for subscription {org_subscription.id} with prorations"
        )
        return stripe_subscription

    except OrganizationSubscription.DoesNotExist:
        logger.error(
            f"Organization subscription with Stripe ID {subscription_object.id} not found"
        )
        raise
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error updating subscription seat count: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error updating subscription seat count: {str(e)}")
        raise
