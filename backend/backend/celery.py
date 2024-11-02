import os
from backend.settings import settings_module
from celery import Celery

# Set the default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)

# Create the Celery app
app = Celery(
    "backend",
    broker_connection_retry_on_startup=True,
)

app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()
