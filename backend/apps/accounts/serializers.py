"""Serializers for authentication, password management, and user profiles."""
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    """Public/authenticated representation of a SpendWise user."""

    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "occupation",
            "currency_preference",
            "theme_preference",
            "notify_budget_alerts",
            "notify_goal_milestones",
            "notify_monthly_summary",
            "initials",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "initials"]

    def get_initials(self, obj):
        parts = [p for p in obj.full_name.strip().split() if p]
        if not parts:
            return obj.email[:2].upper()
        if len(parts) == 1:
            return parts[0][:2].upper()
        return f"{parts[0][0]}{parts[-1][0]}".upper()


class RegisterSerializer(serializers.Serializer):
    """Validates new user registration payloads."""

    full_name = serializers.CharField(max_length=150, min_length=2)
    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=False)
    currency_preference = serializers.ChoiceField(
        choices=User.CURRENCY_CHOICES, default="INR", required=False
    )

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        confirm = attrs.get("confirm_password")
        if confirm is not None and attrs["password"] != confirm:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        return User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
            currency_preference=validated_data.get("currency_preference", "INR"),
        )


class LoginSerializer(serializers.Serializer):
    """Validates email + password login requests."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        attrs["user"] = user
        return attrs


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Allows authenticated users to update profile and preferences."""

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "phone",
            "occupation",
            "currency_preference",
            "theme_preference",
            "notify_budget_alerts",
            "notify_goal_milestones",
            "notify_monthly_summary",
        ]

    def validate_email(self, value):
        normalized = value.strip().lower()
        user = self.instance
        if User.objects.filter(email=normalized).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already used by another account.")
        return normalized


class ChangePasswordSerializer(serializers.Serializer):
    """Validates current and new passwords during password change."""

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        try:
            validate_password(value, user=self.context["request"].user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
