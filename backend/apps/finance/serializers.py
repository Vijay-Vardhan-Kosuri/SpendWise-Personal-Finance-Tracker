"""DRF serializers for SpendWise financial models."""
from rest_framework import serializers
from apps.finance.models import (
    Budget,
    Category,
    Expense,
    Income,
    Notification,
    SavingsContribution,
    SavingsGoal,
)
from apps.finance.services import calculate_budget_metrics, calculate_goal_metrics


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "type", "color", "is_default"]
        read_only_fields = ["id", "is_default"]


class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)

    class Meta:
        model = Income
        fields = [
            "id",
            "category",
            "category_name",
            "category_color",
            "amount",
            "date",
            "payment_method",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_category(self, value):
        request = self.context.get("request")
        if value.type != "income":
            raise serializers.ValidationError("Selected category must be an income category.")
        if value.user_id is not None and request and value.user_id != request.user.id:
            raise serializers.ValidationError("Invalid category selection.")
        return value


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "category",
            "category_name",
            "category_color",
            "amount",
            "date",
            "payment_method",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_category(self, value):
        request = self.context.get("request")
        if value.type != "expense":
            raise serializers.ValidationError("Selected category must be an expense category.")
        if value.user_id is not None and request and value.user_id != request.user.id:
            raise serializers.ValidationError("Invalid category selection.")
        return value


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_color = serializers.SerializerMethodField()
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            "id",
            "category",
            "category_name",
            "category_color",
            "month",
            "year",
            "amount",
            "alert_threshold",
            "spent_amount",
            "remaining_amount",
            "utilization_percentage",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def _get_metrics(self, obj):
        cache_attr = "_cached_metrics"
        if not hasattr(obj, cache_attr):
            setattr(obj, cache_attr, calculate_budget_metrics(obj))
        return getattr(obj, cache_attr)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else "Overall Monthly"

    def get_category_color(self, obj):
        return obj.category.color if obj.category else "#14532D"

    def get_spent_amount(self, obj):
        return self._get_metrics(obj)["spent_amount"]

    def get_remaining_amount(self, obj):
        return self._get_metrics(obj)["remaining_amount"]

    def get_utilization_percentage(self, obj):
        return self._get_metrics(obj)["utilization_percentage"]

    def get_status(self, obj):
        return self._get_metrics(obj)["status"]

    def validate_category(self, value):
        if value is not None and value.type != "expense":
            raise serializers.ValidationError("Budgets can only target expense categories.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user
        category = attrs.get("category", getattr(self.instance, "category", None))
        month = attrs.get("month", getattr(self.instance, "month", None))
        year = attrs.get("year", getattr(self.instance, "year", None))

        qs = Budget.objects.filter(user=user, category=category, month=month, year=year)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            label = category.name if category else "Overall Monthly"
            raise serializers.ValidationError(
                f"A budget for {label} in {month:02d}/{year} already exists."
            )
        return attrs


class SavingsContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsContribution
        fields = ["id", "goal", "amount", "contribution_date", "note", "created_at"]
        read_only_fields = ["id", "goal", "created_at"]


class SavingsGoalSerializer(serializers.ModelSerializer):
    saved_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    contributions = SavingsContributionSerializer(many=True, read_only=True)

    class Meta:
        model = SavingsGoal
        fields = [
            "id",
            "title",
            "target_amount",
            "target_date",
            "description",
            "status",
            "saved_amount",
            "remaining_amount",
            "progress_percentage",
            "contributions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def _get_metrics(self, obj):
        if not hasattr(obj, "_cached_goal_metrics"):
            obj._cached_goal_metrics = calculate_goal_metrics(obj)
        return obj._cached_goal_metrics

    def get_saved_amount(self, obj):
        return self._get_metrics(obj)["saved_amount"]

    def get_remaining_amount(self, obj):
        return self._get_metrics(obj)["remaining_amount"]

    def get_progress_percentage(self, obj):
        return self._get_metrics(obj)["progress_percentage"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "type", "is_read", "created_at"]
        read_only_fields = ["id", "title", "message", "type", "created_at"]
