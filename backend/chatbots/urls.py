from django.urls import path
from .views import (
    ChatbotView,
    ChatbotDetailView,
    ChatbotEmbedScriptView,
    ChatbotSSEView,
)

urlpatterns = [
    path("", ChatbotView.as_view(), name="chatbots"),
    path("<uuid:chatbot_id>/", ChatbotDetailView.as_view(), name="chatbot_detail"),
    path(
        "embed/<uuid:embed_id>.js",
        ChatbotEmbedScriptView.as_view(),
        name="chatbot_embed_script",
    ),
    path(
        "chat/<uuid:chatbot_id>/stream/",
        ChatbotSSEView.as_view(),
        name="chat_stream",
    ),
    path(
        "chat/<uuid:chatbot_id>/send/",
        ChatbotSSEView.as_view(),
        name="send_message",
    ),
]
