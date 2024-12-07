from django.urls import path
from .views import LoginView, CustomTokenRefreshView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
]
