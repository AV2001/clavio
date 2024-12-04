from django.urls import path
from .views import UserView, UserDetailView, InviteTeamMemberView

urlpatterns = [
    path("", UserView.as_view(), name="create_user"),
    path("get/", UserDetailView.as_view(), name="get_user"),
    path("invite/", InviteTeamMemberView.as_view(), name="invite_team_member"),
]
