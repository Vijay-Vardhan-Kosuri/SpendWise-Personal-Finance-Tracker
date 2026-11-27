"""JWT token generation, verification, and DRF authentication backend."""
import uuid
from datetime import datetime, timedelta, timezone
import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from apps.accounts.models import RevokedToken, User


def generate_tokens_for_user(user):
    """Issue a signed JWT access and refresh token pair for a user."""
    now = datetime.now(timezone.utc)
    access_exp = now + timedelta(minutes=settings.JWT_ACCESS_MINUTES)
    refresh_exp = now + timedelta(days=settings.JWT_REFRESH_DAYS)

    access_payload = {
        "token_type": "access",
        "user_id": user.id,
        "email": user.email,
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(access_exp.timestamp()),
    }
    refresh_payload = {
        "token_type": "refresh",
        "user_id": user.id,
        "email": user.email,
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(refresh_exp.timestamp()),
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm="HS256")

    return {
        "access": access_token,
        "refresh": refresh_token,
    }


def decode_token(token, expected_type="access"):
    """Decode and validate a JWT token, raising AuthenticationFailed on error."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed("Token has expired.")
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed("Invalid authentication token.")

    if payload.get("token_type") != expected_type:
        raise exceptions.AuthenticationFailed(f"Invalid token type; expected {expected_type}.")

    if expected_type == "refresh":
        jti = payload.get("jti")
        if jti and RevokedToken.objects.filter(jti=jti).exists():
            raise exceptions.AuthenticationFailed("Refresh token has been revoked.")

    return payload


class JWTAuthentication(authentication.BaseAuthentication):
    """DRF Authentication class using Authorization: Bearer <access_token>."""

    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).decode("utf-8")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != self.keyword.lower():
            return None

        payload = decode_token(parts[1], expected_type="access")
        user_id = payload.get("user_id")
        if not user_id:
            raise exceptions.AuthenticationFailed("Token payload missing user identifier.")

        try:
            user = User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed("User account not found or inactive.")

        return (user, payload)

    def authenticate_header(self, request):
        return self.keyword
