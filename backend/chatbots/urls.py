from django.urls import path
from .views import ChatbotView, ChatbotQueryView

urlpatterns = [
    path("", ChatbotView.as_view(), name="chatbots"),
    path("response/", ChatbotQueryView.as_view(), name="chatbot_response"),
]
