"""Authentication, JWT, and profile API tests for SpendWise."""
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.refresh_url = "/api/auth/refresh/"
        self.profile_url = "/api/profile/"

    def test_register_login_and_refresh_flow(self):
        payload = {
            "full_name": "Priya Nair",
            "email": "priya@spendwise.in",
            "password": "StrongPassword@2026",
            "confirm_password": "StrongPassword@2026",
        }
        reg_res = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(reg_res.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", reg_res.data)
        self.assertEqual(reg_res.data["user"]["currency_preference"], "INR")
        self.assertEqual(reg_res.data["user"]["initials"], "PN")

        login_res = self.client.post(
            self.login_url,
            {"email": "priya@spendwise.in", "password": "StrongPassword@2026"},
            format="json",
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        access = login_res.data["tokens"]["access"]
        refresh = login_res.data["tokens"]["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        prof_res = self.client.get(self.profile_url)
        self.assertEqual(prof_res.status_code, status.HTTP_200_OK)
        self.assertEqual(prof_res.data["email"], "priya@spendwise.in")

        refresh_res = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_res.data)

        # Reusing rotated refresh token must fail
        reuse_res = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(reuse_res.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(DEBUG=True)
    def test_forgot_and_reset_password_flow(self):
        user = User.objects.create_user(
            email="reset@spendwise.in",
            full_name="Rohan Mehta",
            password="OldPassword@2026",
        )
        forgot_res = self.client.post(
            "/api/auth/forgot-password/", {"email": user.email}, format="json"
        )
        self.assertEqual(forgot_res.status_code, status.HTTP_200_OK)
        token = forgot_res.data["reset_token"]

        reset_res = self.client.post(
            "/api/auth/reset-password/",
            {
                "token": token,
                "new_password": "NewPassword@2026",
                "confirm_password": "NewPassword@2026",
            },
            format="json",
        )
        self.assertEqual(reset_res.status_code, status.HTTP_200_OK)

        login_res = self.client.post(
            self.login_url,
            {"email": user.email, "password": "NewPassword@2026"},
            format="json",
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
