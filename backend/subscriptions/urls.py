from django.urls import path
from .views import CreateCheckoutSession, stripe_webhook, get_subscription, update_seats

urlpatterns = [
    path(
        "create-checkout-session/",
        CreateCheckoutSession.as_view(),
        name="create-checkout-session",
    ),
    path("stripe-webhook/", stripe_webhook, name="stripe-webhook"),
    path("", get_subscription, name="get-subscription"),
    path("update-seats/", update_seats, name="update_seats"),
]
