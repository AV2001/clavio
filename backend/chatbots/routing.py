from django.urls import re_path
from .consumers import ChatConsumer, ChatbotStatusConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<embed_id>[^/]+)/$", ChatConsumer.as_asgi()),
    re_path(
        r"ws/chatbot/(?P<chatbot_id>[^/]+)/status/$", ChatbotStatusConsumer.as_asgi()
    ),
]
