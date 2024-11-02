import os
from backend.settings import settings_module
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chatbots.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(chatbots.routing.websocket_urlpatterns)
        ),
    }
)
