from django.urls import path
from .views import ChatbotView, ChatbotDetailView, ChatbotEmbedScriptView

urlpatterns = [
    path("", ChatbotView.as_view(), name="chatbots"),
    path("<uuid:chatbot_id>/", ChatbotDetailView.as_view(), name="chatbot_detail"),
    path(
        "embed/<uuid:embed_id>.js",
        ChatbotEmbedScriptView.as_view(),
        name="chatbot_embed_script",
    ),
]
