from django.urls import re_path
from .consumers import ExternalChatConsumer, ChatbotStatusConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<embed_id>[^/]+)/$", ExternalChatConsumer.as_asgi()),
    re_path(
        r"ws/chatbot/(?P<chatbot_id>[^/]+)/status/$", ChatbotStatusConsumer.as_asgi()
    ),
]
