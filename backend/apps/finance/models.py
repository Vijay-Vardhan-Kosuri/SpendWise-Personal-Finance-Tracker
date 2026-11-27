"""Normalized financial domain models for SpendWise."""
from decimal import Decimal
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


PAYMENT_METHOD_CHOICES = [
    ("UPI", "UPI"),
    ("Bank Transfer", "Bank Transfer"),
    ("Card", "Card"),
    ("Cash", "Cash"),
    ("Other", "Other"),
]


class Category(models.Model):
    """Income and expense categories (system defaults + optional user custom)."""

    TYPE_CHOICES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="categories",
    )
    name = models.CharField(max_length=80)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, db_index=True)
    color = models.CharField(max_length=20, default="#14532D")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        ordering = ["type", "name"]
        indexes = [
            models.Index(fields=["type", "is_default"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.type})"


class Income(models.Model):
    """User income records."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="incomes"
    )
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="incomes"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    date = models.DateField(db_index=True)
    payment_method = models.CharField(
        max_length=40, choices=PAYMENT_METHOD_CHOICES, default="Bank Transfer"
    )
    description = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "income"
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "date"]),
            models.Index(fields=["user", "category"]),
        ]

    def __str__(self):
        return f"Income {self.amount} ({self.category.name})"


class Expense(models.Model):
    """User expense records."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="expenses"
    )
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="expenses"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    date = models.DateField(db_index=True)
    payment_method = models.CharField(
        max_length=40, choices=PAYMENT_METHOD_CHOICES, default="UPI"
    )
    description = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "expenses"
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "date"]),
            models.Index(fields=["user", "category"]),
        ]

    def __str__(self):
        return f"Expense {self.amount} ({self.category.name})"


class Budget(models.Model):
    """Monthly overall or category-specific spending budgets."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budgets"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="budgets",
        help_text="Leave empty for an overall monthly budget.",
    )
    month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)]
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("1.00"))],
    )
    alert_threshold = models.PositiveSmallIntegerField(
        default=80, validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "budgets"
        ordering = ["-year", "-month", "id"]
        indexes = [
            models.Index(fields=["user", "year", "month"]),
        ]

    def __str__(self):
        label = self.category.name if self.category else "Overall Monthly"
        return f"{label} Budget ({self.month}/{self.year}): {self.amount}"


class SavingsGoal(models.Model):
    """User savings goals with target amount and target date."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="savings_goals"
    )
    title = models.CharField(max_length=150)
    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("1.00"))],
    )
    target_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "savings_goals"
        ordering = ["status", "-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.target_amount})"


class SavingsContribution(models.Model):
    """Individual contributions toward a savings goal."""

    goal = models.ForeignKey(
        SavingsGoal, on_delete=models.CASCADE, related_name="contributions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="savings_contributions",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    contribution_date = models.DateField(db_index=True)
    note = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "savings_contributions"
        ordering = ["-contribution_date", "-created_at"]
        indexes = [
            models.Index(fields=["goal", "contribution_date"]),
        ]


class Notification(models.Model):
    """In-app notifications for budget alerts and savings goal milestones."""

    TYPE_CHOICES = [
        ("budget_warning", "Budget Warning"),
        ("budget_exceeded", "Budget Exceeded"),
        ("goal_completed", "Goal Completed"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=150)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default="system")
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
        ]
