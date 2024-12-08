from django.urls import path
from .views import UserView, UserDetailView, InviteTeamMemberView

urlpatterns = [
    path("", UserView.as_view(), name="create_user"),
    path("<uuid:user_id>/", UserDetailView.as_view(), name="user_detail"),
    path("invite/", InviteTeamMemberView.as_view(), name="invite_team_member"),
]
