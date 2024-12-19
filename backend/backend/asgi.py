import os
from backend.settings import settings_module
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chatbots.routing import websocket_urlpatterns
import django_eventstream.urls as eventstream_urls
from django.urls import path, re_path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)

django.setup()
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": URLRouter(
            [
                path(
                    "events/",
                    AuthMiddlewareStack(URLRouter(eventstream_urls.urlpatterns)),
                ),
                re_path(r"", django_asgi_app),
            ]
        ),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
