"""Analytics, unified transactions, and cross-user isolation security tests."""
from datetime import date
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.authentication import generate_tokens_for_user
from apps.accounts.models import User
from apps.finance.models import Category, Expense
from apps.finance.services import ensure_default_categories


class AnalyticsAndSecurityTests(APITestCase):
    def setUp(self):
        ensure_default_categories()
        self.user_a = User.objects.create_user(
            email="usera@spendwise.in",
            full_name="User Alpha",
            password="AlphaPassword@2026",
        )
        self.user_b = User.objects.create_user(
            email="userb@spendwise.in",
            full_name="User Beta",
            password="BetaPassword@2026",
        )
        self.food_cat = Category.objects.get(name="Food", type="expense")
        self.salary_cat = Category.objects.get(name="Salary", type="income")

        self.user_b_expense = Expense.objects.create(
            user=self.user_b,
            category=self.food_cat,
            amount="999.00",
            date=date.today(),
            payment_method="Cash",
            description="Private Beta Expense",
        )

        tokens_a = generate_tokens_for_user(self.user_a)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens_a['access']}")

    def test_user_cannot_access_another_users_records(self):
        detail_res = self.client.get(f"/api/expenses/{self.user_b_expense.id}/")
        self.assertEqual(detail_res.status_code, status.HTTP_404_NOT_FOUND)

        list_res = self.client.get("/api/expenses/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(list_res.data["count"], 0)

    def test_dashboard_transactions_and_analytics_endpoints(self):
        today = date.today().isoformat()
        self.client.post(
            "/api/income/",
            {"category": self.salary_cat.id, "amount": "40000.00", "date": today},
            format="json",
        )
        self.client.post(
            "/api/expenses/",
            {"category": self.food_cat.id, "amount": "10000.00", "date": today},
            format="json",
        )

        summary = self.client.get("/api/dashboard/summary/")
        self.assertEqual(summary.status_code, status.HTTP_200_OK)
        self.assertEqual(summary.data["overview"]["total_income"], 40000.0)
        self.assertEqual(summary.data["overview"]["total_expenses"], 10000.0)
        self.assertEqual(summary.data["overview"]["total_balance"], 30000.0)

        tx = self.client.get("/api/transactions/?sort_by=-amount")
        self.assertEqual(tx.status_code, status.HTTP_200_OK)
        self.assertEqual(tx.data["count"], 2)
        self.assertEqual(tx.data["results"][0]["type"], "income")

        monthly = self.client.get("/api/analytics/monthly/")
        self.assertEqual(monthly.status_code, status.HTTP_200_OK)
        self.assertEqual(monthly.data["summary"]["savings_rate"], 75.0)

        cats = self.client.get("/api/analytics/categories/")
        self.assertEqual(cats.status_code, status.HTTP_200_OK)
        self.assertEqual(cats.data["expense_categories"][0]["category"], "Food")

        inc_exp = self.client.get("/api/analytics/income-expense/")
        self.assertEqual(inc_exp.status_code, status.HTTP_200_OK)
        self.assertIn("comparison", inc_exp.data)
