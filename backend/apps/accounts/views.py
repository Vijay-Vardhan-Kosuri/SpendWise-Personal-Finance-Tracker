"""Authentication and user profile views."""
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.authentication import decode_token, generate_tokens_for_user
from apps.accounts.models import PasswordResetToken, RevokedToken, User
from apps.accounts.serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)


class RegisterView(APIView):
    """POST /api/auth/register/ - Create a new user account and issue JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = generate_tokens_for_user(user)
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ - Authenticate with email and password."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = generate_tokens_for_user(user)
        return Response(
            {
                "message": "Login successful.",
                "user": UserSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


class RefreshTokenView(APIView):
    """POST /api/auth/refresh/ - Issue a new access token from a valid refresh token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = decode_token(refresh_token, expected_type="refresh")
        try:
            user = User.objects.get(pk=payload.get("user_id"), is_active=True)
        except User.DoesNotExist:
            return Response(
                {"detail": "User account not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Rotate refresh token by revoking the used JTI
        jti = payload.get("jti")
        if jti:
            RevokedToken.objects.get_or_create(jti=jti, defaults={"user": user})

        tokens = generate_tokens_for_user(user)
        return Response({"tokens": tokens, "access": tokens["access"], "refresh": tokens["refresh"]})


class LogoutView(APIView):
    """POST /api/auth/logout/ - Revoke refresh token on sign out."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                payload = decode_token(refresh_token, expected_type="refresh")
                jti = payload.get("jti")
                if jti:
                    RevokedToken.objects.get_or_create(jti=jti, defaults={"user": request.user})
            except Exception:
                pass
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """POST /api/auth/forgot-password/ - Generate a password reset token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email=email, is_active=True).first()

        response_data = {
            "message": "If an account exists for that email, a password reset token has been generated."
        }
        if user:
            reset_obj = PasswordResetToken.objects.create(user=user)
            if settings.DEBUG:
                # Returned only in DEBUG/local mode so developers can test the full workflow without SMTP
                response_data["reset_token"] = str(reset_obj.token)
        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """POST /api/auth/reset-password/ - Verify reset token and update password."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_value = serializer.validated_data["token"]
        reset_obj = PasswordResetToken.objects.filter(token=token_value).select_related("user").first()

        if not reset_obj or not reset_obj.is_valid:
            return Response(
                {"detail": "Reset token is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = reset_obj.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password", "updated_at"])
        reset_obj.is_used = True
        reset_obj.save(update_fields=["is_used"])
        return Response({"message": "Password reset successfully. You may now sign in."})


class ProfileView(APIView):
    """GET / PUT / PATCH /api/profile/ - View and update authenticated user profile."""

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    """POST /api/profile/change-password/ - Update password for authenticated user."""

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password", "updated_at"])
        return Response({"message": "Password updated successfully."})


class DeleteAccountView(APIView):
    """DELETE /api/profile/delete-account/ - Permanently remove authenticated user account."""

    def delete(self, request):
        password = request.data.get("password", "")
        if not request.user.check_password(password):
            return Response(
                {"detail": "Password confirmation failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.delete()
        return Response({"message": "Account deleted permanently."}, status=status.HTTP_200_OK)
