from .base import *


DEBUG = False
ALLOWED_HOSTS = [
    "clavio.ai",
    "www.clavio.ai",
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "https://www.clavio.ai",
    "https://clavio.ai",
]
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.clavio\.ai$",
]
