"""CRUD, budget calculation, and savings contribution tests."""
from datetime import date
from decimal import Decimal
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.authentication import generate_tokens_for_user
from apps.accounts.models import User
from apps.finance.models import Category
from apps.finance.services import ensure_default_categories


class FinanceApiTests(APITestCase):
    def setUp(self):
        ensure_default_categories()
        self.user = User.objects.create_user(
            email="aarav@spendwise.in",
            full_name="Aarav Sharma",
            password="SecurePassword@2026",
        )
        tokens = generate_tokens_for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        self.salary_cat = Category.objects.get(name="Salary", type="income")
        self.food_cat = Category.objects.get(name="Food", type="expense")

    def test_income_expense_budget_and_alerts(self):
        today = date.today()
        # Create monthly food budget of 5000
        budget_res = self.client.post(
            "/api/budgets/",
            {
                "category": self.food_cat.id,
                "month": today.month,
                "year": today.year,
                "amount": "5000.00",
                "alert_threshold": 80,
            },
            format="json",
        )
        self.assertEqual(budget_res.status_code, status.HTTP_201_CREATED)

        # Add income
        inc_res = self.client.post(
            "/api/income/",
            {
                "category": self.salary_cat.id,
                "amount": "50000.00",
                "date": today.isoformat(),
                "payment_method": "Bank Transfer",
                "description": "Monthly Salary",
            },
            format="json",
        )
        self.assertEqual(inc_res.status_code, status.HTTP_201_CREATED)

        # Add food expense of 4200 (84% -> triggers warning notification)
        exp_res = self.client.post(
            "/api/expenses/",
            {
                "category": self.food_cat.id,
                "amount": "4200.00",
                "date": today.isoformat(),
                "payment_method": "UPI",
                "description": "Weekly groceries",
            },
            format="json",
        )
        self.assertEqual(exp_res.status_code, status.HTTP_201_CREATED)

        # Verify budget metrics
        budgets = self.client.get(f"/api/budgets/?month={today.month}&year={today.year}")
        self.assertEqual(budgets.status_code, status.HTTP_200_OK)
        food_budget = budgets.data[0]
        self.assertEqual(Decimal(food_budget["spent_amount"]), Decimal("4200.00"))
        self.assertEqual(Decimal(food_budget["remaining_amount"]), Decimal("800.00"))
        self.assertEqual(food_budget["utilization_percentage"], 84.0)
        self.assertEqual(food_budget["status"], "warning")

        # Verify notification generated
        notif_res = self.client.get("/api/notifications/")
        self.assertEqual(notif_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(notif_res.data["unread_count"], 1)

    def test_savings_goal_and_contribution_completion(self):
        today = date.today()
        goal_res = self.client.post(
            "/api/savings/",
            {
                "title": "Buy a laptop",
                "target_amount": "60000.00",
                "target_date": today.isoformat(),
                "description": "Work laptop",
            },
            format="json",
        )
        self.assertEqual(goal_res.status_code, status.HTTP_201_CREATED)
        goal_id = goal_res.data["id"]

        contrib_1 = self.client.post(
            f"/api/savings/{goal_id}/contribute/",
            {
                "amount": "25000.00",
                "contribution_date": today.isoformat(),
                "note": "First installment",
            },
            format="json",
        )
        self.assertEqual(contrib_1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(contrib_1.data["saved_amount"]), Decimal("25000.00"))
        self.assertEqual(Decimal(contrib_1.data["remaining_amount"]), Decimal("35000.00"))
        self.assertEqual(contrib_1.data["status"], "pending")

        contrib_2 = self.client.post(
            f"/api/savings/{goal_id}/contribute/",
            {
                "amount": "35000.00",
                "contribution_date": today.isoformat(),
                "note": "Final installment",
            },
            format="json",
        )
        self.assertEqual(contrib_2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(contrib_2.data["status"], "completed")
        self.assertEqual(contrib_2.data["progress_percentage"], 100.0)
