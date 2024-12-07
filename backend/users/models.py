import uuid
from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from organizations.models import Organization


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(
            id=uuid.uuid4(), email=email, full_name=full_name, **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="organization_employees",
        null=True,
        blank=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    class Meta:
        db_table = "organization_employees"

    def save(self, *args, **kwargs):
        if self._state.adding or self._password_has_changed():
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def _password_has_changed(self):
        if not self.pk:
            return False
        if self.password is None:
            return False
        old_password = User.objects.get(pk=self.pk).password

        return self.password != old_password


class TeamInvite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField()
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="invites"
    )
    invited_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_invites"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_invite = models.BooleanField(default=False)

    class Meta:
        db_table = "team_invites"
        unique_together = ["email", "organization"]
