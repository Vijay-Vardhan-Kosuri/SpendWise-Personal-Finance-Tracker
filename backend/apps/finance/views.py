"""REST API views for SpendWise finance modules."""
from datetime import date
from decimal import Decimal
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.finance.models import (
    Budget,
    Category,
    Expense,
    Income,
    Notification,
    SavingsGoal,
)
from apps.finance.permissions import IsOwner
from apps.finance.serializers import (
    BudgetSerializer,
    CategorySerializer,
    ExpenseSerializer,
    IncomeSerializer,
    NotificationSerializer,
    SavingsContributionSerializer,
    SavingsGoalSerializer,
)
from apps.finance.services import (
    ensure_default_categories,
    evaluate_budget_alerts,
    get_budget_performance,
    get_category_breakdown,
    get_dashboard_summary,
    get_income_expense_series,
    record_savings_contribution,
    resolve_period_bounds,
    seed_demo_data_for_user,
)


def _parse_iso_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


class CategoryListView(APIView):
    """GET/POST /api/categories/ - List default + user categories or add a custom category."""

    def get(self, request):
        ensure_default_categories()
        cat_type = request.query_params.get("type")
        qs = Category.objects.filter(Q(user__isnull=True) | Q(user=request.user))
        if cat_type in ("income", "expense"):
            qs = qs.filter(type=cat_type)
        serializer = CategorySerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, is_default=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class IncomeViewSet(viewsets.ModelViewSet):
    """CRUD API for user income entries with search, category, and date filtering."""

    serializer_class = IncomeSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        ensure_default_categories()
        qs = Income.objects.filter(user=self.request.user).select_related("category")
        params = self.request.query_params
        if params.get("category"):
            qs = qs.filter(category_id=params["category"])
        if params.get("payment_method"):
            qs = qs.filter(payment_method=params["payment_method"])
        if params.get("search"):
            q = params["search"].strip()
            qs = qs.filter(Q(description__icontains=q) | Q(category__name__icontains=q))
        start_d = _parse_iso_date(params.get("start_date"))
        end_d = _parse_iso_date(params.get("end_date"))
        if start_d:
            qs = qs.filter(date__gte=start_d)
        if end_d:
            qs = qs.filter(date__lte=end_d)
        if params.get("month") and params.get("year"):
            qs = qs.filter(date__month=int(params["month"]), date__year=int(params["year"]))
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_amount = queryset.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            resp = self.get_paginated_response(serializer.data)
            resp.data["summary_total"] = float(total_amount)
            return resp
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data, "summary_total": float(total_amount)})


class ExpenseViewSet(viewsets.ModelViewSet):
    """CRUD API for user expenses with filtering, summaries, and budget alert triggers."""

    serializer_class = ExpenseSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        ensure_default_categories()
        qs = Expense.objects.filter(user=self.request.user).select_related("category")
        params = self.request.query_params
        if params.get("category"):
            qs = qs.filter(category_id=params["category"])
        if params.get("payment_method"):
            qs = qs.filter(payment_method=params["payment_method"])
        if params.get("search"):
            q = params["search"].strip()
            qs = qs.filter(Q(description__icontains=q) | Q(category__name__icontains=q))
        start_d = _parse_iso_date(params.get("start_date"))
        end_d = _parse_iso_date(params.get("end_date"))
        if start_d:
            qs = qs.filter(date__gte=start_d)
        if end_d:
            qs = qs.filter(date__lte=end_d)
        if params.get("month") and params.get("year"):
            qs = qs.filter(date__month=int(params["month"]), date__year=int(params["year"]))
        return qs

    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        evaluate_budget_alerts(self.request.user, expense.date, expense.category)

    def perform_update(self, serializer):
        expense = serializer.save()
        evaluate_budget_alerts(self.request.user, expense.date, expense.category)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_amount = queryset.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            resp = self.get_paginated_response(serializer.data)
            resp.data["summary_total"] = float(total_amount)
            return resp
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data, "summary_total": float(total_amount)})


class BudgetViewSet(viewsets.ModelViewSet):
    """CRUD API for monthly overall and category budgets."""

    serializer_class = BudgetSerializer
    permission_classes = [IsOwner]
    pagination_class = None

    def get_queryset(self):
        ensure_default_categories()
        qs = Budget.objects.filter(user=self.request.user).select_related("category")
        month = self.request.query_params.get("month")
        year = self.request.query_params.get("year")
        if month:
            qs = qs.filter(month=int(month))
        if year:
            qs = qs.filter(year=int(year))
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavingsGoalViewSet(viewsets.ModelViewSet):
    """CRUD API for savings goals and contribution logging."""

    serializer_class = SavingsGoalSerializer
    permission_classes = [IsOwner]
    pagination_class = None

    def get_queryset(self):
        qs = SavingsGoal.objects.filter(user=self.request.user).prefetch_related("contributions")
        status_filter = self.request.query_params.get("status")
        if status_filter in ("pending", "completed"):
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="contribute")
    def contribute(self, request, pk=None):
        goal = self.get_object()
        serializer = SavingsContributionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record_savings_contribution(
            goal=goal,
            user=request.user,
            amount=serializer.validated_data["amount"],
            contribution_date=serializer.validated_data["contribution_date"],
            note=serializer.validated_data.get("note", ""),
        )
        goal.refresh_from_db()
        return Response(SavingsGoalSerializer(goal).data, status=status.HTTP_201_CREATED)


class DashboardSummaryView(APIView):
    """GET /api/dashboard/summary/ - Dynamic financial summary, charts, and progress."""

    def get(self, request):
        ensure_default_categories()
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        start_date = _parse_iso_date(request.query_params.get("start_date"))
        end_date = _parse_iso_date(request.query_params.get("end_date"))
        data = get_dashboard_summary(
            user=request.user,
            month=month,
            year=year,
            start_date=start_date,
            end_date=end_date,
        )
        return Response(data)


class UnifiedTransactionsView(APIView):
    """GET /api/transactions/ - Unified paginated, searchable, sortable transaction ledger."""

    def get(self, request):
        params = request.query_params
        tx_type = params.get("type", "all")
        search = params.get("search", "").strip().lower()
        category_id = params.get("category")
        start_date = _parse_iso_date(params.get("start_date"))
        end_date = _parse_iso_date(params.get("end_date"))
        sort_by = params.get("sort_by", "-date")
        page = max(int(params.get("page", 1)), 1)
        page_size = min(max(int(params.get("page_size", 10)), 1), 100)

        records = []

        if tx_type in ("all", "income"):
            inc_qs = Income.objects.filter(user=request.user).select_related("category")
            if category_id:
                inc_qs = inc_qs.filter(category_id=category_id)
            if start_date:
                inc_qs = inc_qs.filter(date__gte=start_date)
            if end_date:
                inc_qs = inc_qs.filter(date__lte=end_date)
            if search:
                inc_qs = inc_qs.filter(
                    Q(description__icontains=search)
                    | Q(category__name__icontains=search)
                    | Q(payment_method__icontains=search)
                )
            for item in inc_qs:
                records.append(
                    {
                        "uid": f"income-{item.id}",
                        "id": item.id,
                        "type": "income",
                        "category": item.category_id,
                        "category_name": item.category.name,
                        "category_color": item.category.color,
                        "amount": float(item.amount),
                        "date": item.date.isoformat(),
                        "payment_method": item.payment_method,
                        "description": item.description or item.category.name,
                        "created_at": item.created_at.isoformat(),
                    }
                )

        if tx_type in ("all", "expense"):
            exp_qs = Expense.objects.filter(user=request.user).select_related("category")
            if category_id:
                exp_qs = exp_qs.filter(category_id=category_id)
            if start_date:
                exp_qs = exp_qs.filter(date__gte=start_date)
            if end_date:
                exp_qs = exp_qs.filter(date__lte=end_date)
            if search:
                exp_qs = exp_qs.filter(
                    Q(description__icontains=search)
                    | Q(category__name__icontains=search)
                    | Q(payment_method__icontains=search)
                )
            for item in exp_qs:
                records.append(
                    {
                        "uid": f"expense-{item.id}",
                        "id": item.id,
                        "type": "expense",
                        "category": item.category_id,
                        "category_name": item.category.name,
                        "category_color": item.category.color,
                        "amount": float(item.amount),
                        "date": item.date.isoformat(),
                        "payment_method": item.payment_method,
                        "description": item.description or item.category.name,
                        "created_at": item.created_at.isoformat(),
                    }
                )

        if sort_by == "date":
            records.sort(key=lambda r: (r["date"], r["created_at"]))
        elif sort_by == "amount":
            records.sort(key=lambda r: r["amount"])
        elif sort_by == "-amount":
            records.sort(key=lambda r: r["amount"], reverse=True)
        else:
            records.sort(key=lambda r: (r["date"], r["created_at"]), reverse=True)

        total_count = len(records)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        total_income = sum(r["amount"] for r in records if r["type"] == "income")
        total_expenses = sum(r["amount"] for r in records if r["type"] == "expense")

        return Response(
            {
                "count": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": max((total_count + page_size - 1) // page_size, 1),
                "totals": {
                    "income": round(total_income, 2),
                    "expenses": round(total_expenses, 2),
                    "net": round(total_income - total_expenses, 2),
                },
                "results": records[start_idx:end_idx],
            }
        )


class AnalyticsMonthlyView(APIView):
    """GET /api/analytics/monthly/ - Monthly income, expense, savings rate, and budget performance."""

    def get(self, request):
        months = min(max(int(request.query_params.get("months", 6)), 1), 24)
        start_date = _parse_iso_date(request.query_params.get("start_date"))
        end_date = _parse_iso_date(request.query_params.get("end_date"))
        today = date.today()
        month = int(request.query_params.get("month", today.month))
        year = int(request.query_params.get("year", today.year))

        series = get_income_expense_series(
            request.user, months=months, start_date=start_date, end_date=end_date
        )
        total_income = sum(item["income"] for item in series)
        total_expenses = sum(item["expenses"] for item in series)
        savings_rate = (
            round(((total_income - total_expenses) / total_income) * 100, 1)
            if total_income > 0
            else 0.0
        )

        budget_perf = get_budget_performance(request.user, month=month, year=year)

        return Response(
            {
                "monthly_series": series,
                "summary": {
                    "total_income": round(total_income, 2),
                    "total_expenses": round(total_expenses, 2),
                    "net_savings": round(total_income - total_expenses, 2),
                    "savings_rate": savings_rate,
                },
                "budget_performance": budget_perf,
            }
        )


class AnalyticsCategoriesView(APIView):
    """GET /api/analytics/categories/ - Category-wise spending and income breakdown."""

    def get(self, request):
        start_date = _parse_iso_date(request.query_params.get("start_date"))
        end_date = _parse_iso_date(request.query_params.get("end_date"))
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        period_start, period_end, _, _ = resolve_period_bounds(
            month=month, year=year, start_date=start_date, end_date=end_date
        )
        expense_categories = get_category_breakdown(
            request.user, period_start, period_end, "expense"
        )
        income_categories = get_category_breakdown(
            request.user, period_start, period_end, "income"
        )
        return Response(
            {
                "period": {
                    "start_date": period_start.isoformat(),
                    "end_date": period_end.isoformat(),
                },
                "expense_categories": expense_categories,
                "income_categories": income_categories,
            }
        )


class AnalyticsIncomeExpenseView(APIView):
    """GET /api/analytics/income-expense/ - Income vs Expense trend comparison."""

    def get(self, request):
        months = min(max(int(request.query_params.get("months", 6)), 1), 24)
        start_date = _parse_iso_date(request.query_params.get("start_date"))
        end_date = _parse_iso_date(request.query_params.get("end_date"))
        series = get_income_expense_series(
            request.user, months=months, start_date=start_date, end_date=end_date
        )
        return Response({"comparison": series})


class NotificationListView(APIView):
    """GET /api/notifications/ - List authenticated user's notifications."""

    def get(self, request):
        qs = Notification.objects.filter(user=request.user)[:30]
        return Response(
            {
                "unread_count": Notification.objects.filter(user=request.user, is_read=False).count(),
                "results": NotificationSerializer(qs, many=True).data,
            }
        )


class NotificationMarkReadView(APIView):
    """PATCH /api/notifications/{id}/read/ - Mark a single notification as read."""

    def patch(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notif).data)


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/mark-all-read/ - Mark all notifications read."""

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."})


class DemoSeedView(APIView):
    """POST /api/demo/seed/ - Populate sample data strictly for demo evaluation."""

    def post(self, request):
        seed_demo_data_for_user(request.user)
        return Response(
            {"message": "Sample demo financial records loaded for your account."},
            status=status.HTTP_201_CREATED,
        )
