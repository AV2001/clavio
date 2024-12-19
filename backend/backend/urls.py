from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("auth.urls")),
    path("api/users/", include("users.urls")),
    path("api/organizations/", include("organizations.urls")),
    path("api/chatbots/", include("chatbots.urls")),
    path("api/events/", include("django_eventstream.urls"), {"channels": ["chatbot"]}),
    path("api/subscriptions/", include("subscriptions.urls")),
]
