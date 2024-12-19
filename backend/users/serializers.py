from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "is_admin",
            "created_at",
            "accepted_invite",
        ]

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "fullName": instance.full_name,
            "email": instance.email,
            "isAdmin": instance.is_admin,
            "createdAt": instance.created_at,
            "acceptedInvite": instance.accepted_invite,
        }
