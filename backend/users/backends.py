from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, **kwargs):
        try:
            user = User.objects.get(email=email)
            return user
        except User.DoesNotExist:
            return None
