from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = ["clavio.ai", "www.clavio.ai", "*"]

# Must be removed in production
STATIC_URL = "/static/"


# Redis/Celery Configuration
# Add ssl_cert_reqs=CERT_NONE to the URL
REDIS_BASE_URL = os.getenv("REDIS_URL")
CELERY_BROKER_URL = f"{REDIS_BASE_URL}?ssl_cert_reqs=CERT_NONE"
CELERY_RESULT_BACKEND = f"{REDIS_BASE_URL}?ssl_cert_reqs=CERT_NONE"


# Channel Layers for WebSocket
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [{"address": REDIS_BASE_URL, "ssl_cert_reqs": None}],
        },
    },
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "https://www.clavio.ai",
    "https://clavio.ai",
]
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.clavio\.ai$",
]
