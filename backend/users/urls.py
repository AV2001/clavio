from django.urls import path
from .views import UserView, UserDetailView

urlpatterns = [
    path("", UserView.as_view(), name="create_user")]