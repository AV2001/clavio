from django.urls import path
from .views import TokenObtainView, LogoutView

urlpatterns = [
    path("token/", TokenObtainView.as_view(), name="token-get"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
