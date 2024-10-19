import uuid
from django.db import models
from organizations.models import Organization


class Chatbot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    initial_message = models.TextField()
    color = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="chatbots"
    )

    class Meta:
        db_table = "chatbots"
