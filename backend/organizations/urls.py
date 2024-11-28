from django.urls import path
from .views import OrganizationView, OrganizationDetailView

urlpatterns = [
    path("", OrganizationView.as_view(), name="create_organization"),
    path("get/", OrganizationDetailView.as_view(), name="get_organization"),
]
