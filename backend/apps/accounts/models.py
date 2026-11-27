"""Custom User and authentication support models for SpendWise."""
import uuid
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Manager for email-authenticated SpendWise users."""

    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must provide an email address.")
        if not full_name:
            raise ValueError("Users must provide a full name.")
        normalized_email = self.normalize_email(email).lower()
        user = self.model(email=normalized_email, full_name=full_name.strip(), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email=email, full_name=full_name, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Normalized Users table storing identity and financial preferences."""

    CURRENCY_CHOICES = [
        ("INR", "INR (₹)"),
        ("USD", "USD ($)"),
        ("EUR", "EUR (€)"),
        ("GBP", "GBP (£)"),
    ]
    THEME_CHOICES = [
        ("light", "Light"),
        ("dark", "Dark"),
    ]

    email = models.EmailField(unique=True, max_length=255, db_index=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, default="")
    occupation = models.CharField(max_length=100, blank=True, default="")
    currency_preference = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="INR")
    theme_preference = models.CharField(max_length=10, choices=THEME_CHOICES, default="light")
    notify_budget_alerts = models.BooleanField(default=True)
    notify_goal_milestones = models.BooleanField(default=True)
    notify_monthly_summary = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} <{self.email}>"


class PasswordResetToken(models.Model):
    """Short-lived token for password reset requests."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "password_reset_tokens"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return (not self.is_used) and self.expires_at > timezone.now()


class RevokedToken(models.Model):
    """Tracks revoked JWT refresh JTIs on logout."""

    jti = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="revoked_tokens")
    revoked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "revoked_tokens"
