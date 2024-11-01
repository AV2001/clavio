from rest_framework import serializers
from .models import Chatbot


class ChatbotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chatbot
        fields = "__all__"

    def to_representation(self, instance):
        camelcase_representation = {
            "id": str(instance.id),
            "organization": instance.organization.name,
            "embedId": str(instance.embed_id),
            "name": instance.name,
            "initialMessage": instance.initial_message,
            "image": instance.image,
            "primaryColor": instance.primary_color,
            "secondaryColor": instance.secondary_color,
            "chatbotBorderRadius": instance.chatbot_border_radius,
            "fontSize": instance.font_size,
            "widgetColor": instance.widget_color,
            "widgetBorderRadius": instance.widget_border_radius,
            "createdAt": instance.created_at,
            "status": instance.status,
        }

        return camelcase_representation
