"""URL routing for authentication and user profile endpoints."""
from django.urls import path
from apps.accounts.views import (
    ChangePasswordView,
    DeleteAccountView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    ProfileView,
    RefreshTokenView,
    RegisterView,
    ResetPasswordView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshTokenView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("profile/", ProfileView.as_view(), name="user-profile"),
    path("profile/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("profile/delete-account/", DeleteAccountView.as_view(), name="delete-account"),
]
