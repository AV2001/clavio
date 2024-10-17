import os
from dotenv import load_dotenv

load_dotenv()

# Determine settings module based on environment
django_env = os.getenv("DJANGO_ENV", "prod")
settings_module = f"backend.settings.{django_env}"

# Set DJANGO_SETTINGS_MODULE
os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)
