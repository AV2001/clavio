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
    embed_id = models.UUIDField(unique=True, null=True, editable=False)

    class Meta:
        db_table = "chatbots"

    def save(self, *args, **kwargs):
        if not self.embed_id:
            self.embed_id = uuid.uuid4()
        super().save(*args, **kwargs)


class ChatbotUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    chatbot = models.ForeignKey(Chatbot, on_delete=models.CASCADE, related_name="users")
    history = models.JSONField(default=list, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chatbot_users"
