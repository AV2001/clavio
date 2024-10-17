from .base import *


STATIC_URL = "/static/"

DEBUG = True
ALLOWED_HOSTS = ["localhost", "0.0.0.0"]

# CORS Settings
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
