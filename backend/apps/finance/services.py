"""Business logic and aggregation services for SpendWise finance domain."""
from datetime import date, timedelta
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from apps.finance.models import (
    Budget,
    Category,
    Expense,
    Income,
    Notification,
    SavingsContribution,
    SavingsGoal,
)

DEFAULT_INCOME_CATEGORIES = [
    ("Salary", "#14532D"),
    ("Freelancing", "#059669"),
    ("Business", "#047857"),
    ("Investments", "#0D9488"),
    ("Other income", "#4B5563"),
]

DEFAULT_EXPENSE_CATEGORIES = [
    ("Food", "#14532D"),
    ("Shopping", "#059669"),
    ("Transportation", "#0284C7"),
    ("Education", "#4F46E5"),
    ("Entertainment", "#D97706"),
    ("Healthcare", "#DC2626"),
    ("Housing", "#7C3AED"),
    ("Bills", "#EA580C"),
    ("Other", "#6B7280"),
]


def ensure_default_categories():
    """Idempotently create system default income and expense categories."""
    for name, color in DEFAULT_INCOME_CATEGORIES:
        Category.objects.get_or_create(
            user=None,
            name=name,
            type="income",
            defaults={"color": color, "is_default": True},
        )
    for name, color in DEFAULT_EXPENSE_CATEGORIES:
        Category.objects.get_or_create(
            user=None,
            name=name,
            type="expense",
            defaults={"color": color, "is_default": True},
        )


def resolve_period_bounds(month=None, year=None, start_date=None, end_date=None):
    """Resolve explicit start/end dates or fall back to given/current month."""
    today = date.today()
    if start_date and end_date:
        return start_date, end_date, start_date.month, start_date.year

    target_year = int(year) if year else today.year
    target_month = int(month) if month else today.month
    first_day = date(target_year, target_month, 1)
    if target_month == 12:
        last_day = date(target_year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(target_year, target_month + 1, 1) - timedelta(days=1)
    return first_day, last_day, target_month, target_year


def calculate_budget_metrics(budget):
    """Compute spent, remaining, utilization percentage, and status for a budget."""
    expenses_qs = Expense.objects.filter(
        user=budget.user,
        date__year=budget.year,
        date__month=budget.month,
    )
    if budget.category_id is not None:
        expenses_qs = expenses_qs.filter(category_id=budget.category_id)

    spent = expenses_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    remaining = budget.amount - spent
    pct = float((spent / budget.amount) * Decimal("100")) if budget.amount > 0 else 0.0
    pct_rounded = round(pct, 1)

    if pct >= 100:
        budget_status = "exceeded"
    elif pct >= budget.alert_threshold:
        budget_status = "warning"
    else:
        budget_status = "healthy"

    return {
        "spent_amount": str(spent.quantize(Decimal("0.01"))),
        "remaining_amount": str(remaining.quantize(Decimal("0.01"))),
        "utilization_percentage": pct_rounded,
        "status": budget_status,
    }


def evaluate_budget_alerts(user, expense_date, category):
    """Generate budget warning/exceeded notifications when spending crosses thresholds."""
    if not user.notify_budget_alerts:
        return

    matching_budgets = Budget.objects.filter(
        user=user,
        month=expense_date.month,
        year=expense_date.year,
    ).filter(category__in=[category, None])

    # Also match budgets where category is NULL explicitly
    overall_budgets = Budget.objects.filter(
        user=user, month=expense_date.month, year=expense_date.year, category__isnull=True
    )
    budgets_to_check = list(
        Budget.objects.filter(
            user=user, month=expense_date.month, year=expense_date.year, category=category
        )
    ) + list(overall_budgets)

    for budget in budgets_to_check:
        metrics = calculate_budget_metrics(budget)
        pct = metrics["utilization_percentage"]
        label = budget.category.name if budget.category else "Overall Monthly"
        period_tag = f"{budget.month:02d}/{budget.year}"

        if pct >= 100:
            title = f"{label} budget exceeded ({period_tag})"
            notif_type = "budget_exceeded"
            msg = (
                f"You have spent {metrics['spent_amount']} of your {budget.amount} "
                f"{label.lower()} budget ({pct}%)."
            )
        elif pct >= budget.alert_threshold:
            title = f"{label} budget warning ({period_tag})"
            notif_type = "budget_warning"
            msg = (
                f"You have used {pct}% of your {label.lower()} budget "
                f"({metrics['spent_amount']} / {budget.amount})."
            )
        else:
            continue

        already_exists = Notification.objects.filter(
            user=user, title=title, type=notif_type, is_read=False
        ).exists()
        if not already_exists:
            Notification.objects.create(
                user=user, title=title, message=msg, type=notif_type
            )


def calculate_goal_metrics(goal):
    """Compute saved, remaining, and percentage for a savings goal."""
    saved = goal.contributions.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    remaining = max(goal.target_amount - saved, Decimal("0.00"))
    pct = float((saved / goal.target_amount) * Decimal("100")) if goal.target_amount > 0 else 0.0
    return {
        "saved_amount": str(saved.quantize(Decimal("0.01"))),
        "remaining_amount": str(remaining.quantize(Decimal("0.01"))),
        "progress_percentage": round(min(pct, 100.0), 1),
    }


@transaction.atomic
def record_savings_contribution(goal, user, amount, contribution_date, note=""):
    """Create a savings contribution and update goal completion status if target reached."""
    contribution = SavingsContribution.objects.create(
        goal=goal,
        user=user,
        amount=amount,
        contribution_date=contribution_date,
        note=note,
    )
    total_saved = goal.contributions.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    if total_saved >= goal.target_amount and goal.status != "completed":
        goal.status = "completed"
        goal.save(update_fields=["status", "updated_at"])
        if user.notify_goal_milestones:
            Notification.objects.create(
                user=user,
                title=f"Goal completed: {goal.title}",
                message=f"Congratulations! You reached your savings target of {goal.target_amount} for '{goal.title}'.",
                type="goal_completed",
            )
    return contribution


def _month_series_bounds(num_months=6, ref_date=None):
    """Return ordered list of (year, month, label) for the trailing N months."""
    today = ref_date or date.today()
    months_list = []
    y, m = today.year, today.month
    for _ in range(num_months):
        months_list.append((y, m, date(y, m, 1).strftime("%b %Y")))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    months_list.reverse()
    return months_list


def get_income_expense_series(user, months=6, start_date=None, end_date=None):
    """Build monthly income vs expense comparison series."""
    if start_date and end_date:
        income_rows = (
            Income.objects.filter(user=user, date__range=(start_date, end_date))
            .annotate(period=TruncMonth("date"))
            .values("period")
            .annotate(total=Sum("amount"))
        )
        expense_rows = (
            Expense.objects.filter(user=user, date__range=(start_date, end_date))
            .annotate(period=TruncMonth("date"))
            .values("period")
            .annotate(total=Sum("amount"))
        )
        inc_map = {r["period"].strftime("%Y-%m"): float(r["total"]) for r in income_rows if r["period"]}
        exp_map = {r["period"].strftime("%Y-%m"): float(r["total"]) for r in expense_rows if r["period"]}
        all_keys = sorted(set(inc_map.keys()) | set(exp_map.keys()))
        series = []
        for key in all_keys:
            y, m = map(int, key.split("-"))
            label = date(y, m, 1).strftime("%b %Y")
            inc_val = inc_map.get(key, 0.0)
            exp_val = exp_map.get(key, 0.0)
            series.append(
                {
                    "month": label,
                    "month_key": key,
                    "income": round(inc_val, 2),
                    "expenses": round(exp_val, 2),
                    "net_savings": round(inc_val - exp_val, 2),
                }
            )
        return series

    bounds = _month_series_bounds(months)
    earliest_year, earliest_month, _ = bounds[0]
    earliest_date = date(earliest_year, earliest_month, 1)

    income_rows = (
        Income.objects.filter(user=user, date__gte=earliest_date)
        .annotate(period=TruncMonth("date"))
        .values("period")
        .annotate(total=Sum("amount"))
    )
    expense_rows = (
        Expense.objects.filter(user=user, date__gte=earliest_date)
        .annotate(period=TruncMonth("date"))
        .values("period")
        .annotate(total=Sum("amount"))
    )
    inc_map = {(r["period"].year, r["period"].month): float(r["total"]) for r in income_rows if r["period"]}
    exp_map = {(r["period"].year, r["period"].month): float(r["total"]) for r in expense_rows if r["period"]}

    series = []
    for y, m, label in bounds:
        inc_val = inc_map.get((y, m), 0.0)
        exp_val = exp_map.get((y, m), 0.0)
        series.append(
            {
                "month": label,
                "month_key": f"{y:04d}-{m:02d}",
                "income": round(inc_val, 2),
                "expenses": round(exp_val, 2),
                "net_savings": round(inc_val - exp_val, 2),
            }
        )
    return series


def get_category_breakdown(user, start_date, end_date, record_type="expense"):
    """Aggregate income or expenses by category for a date range."""
    model = Expense if record_type == "expense" else Income
    rows = (
        model.objects.filter(user=user, date__range=(start_date, end_date))
        .values("category__id", "category__name", "category__color")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )
    grand_total = sum((r["total"] or Decimal("0.00")) for r in rows)
    result = []
    for r in rows:
        amt = float(r["total"] or 0)
        pct = round((float(r["total"]) / float(grand_total)) * 100, 1) if grand_total > 0 else 0.0
        result.append(
            {
                "category_id": r["category__id"],
                "category": r["category__name"],
                "color": r["category__color"] or "#14532D",
                "amount": round(amt, 2),
                "percentage": pct,
            }
        )
    return result


def get_dashboard_summary(user, month=None, year=None, start_date=None, end_date=None):
    """Assemble full dashboard KPIs, charts, budgets, savings, and recent transactions."""
    period_start, period_end, target_month, target_year = resolve_period_bounds(
        month=month, year=year, start_date=start_date, end_date=end_date
    )

    all_income = Income.objects.filter(user=user).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    all_expenses = Expense.objects.filter(user=user).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    total_balance = all_income - all_expenses

    period_income = (
        Income.objects.filter(user=user, date__range=(period_start, period_end)).aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )
    period_expenses = (
        Expense.objects.filter(user=user, date__range=(period_start, period_end)).aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    total_savings = (
        SavingsContribution.objects.filter(user=user).aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )

    # Monthly budget utilization
    budgets_qs = Budget.objects.filter(user=user, month=target_month, year=target_year).select_related(
        "category"
    )
    overall_budget = budgets_qs.filter(category__isnull=True).first()
    if overall_budget:
        metrics = calculate_budget_metrics(overall_budget)
        budget_utilization = {
            "allocated": float(overall_budget.amount),
            "spent": float(metrics["spent_amount"]),
            "remaining": float(metrics["remaining_amount"]),
            "percentage": metrics["utilization_percentage"],
            "status": metrics["status"],
        }
    elif budgets_qs.exists():
        allocated = sum((b.amount for b in budgets_qs), Decimal("0.00"))
        spent = sum((Decimal(calculate_budget_metrics(b)["spent_amount"]) for b in budgets_qs), Decimal("0.00"))
        remaining = allocated - spent
        pct = round(float((spent / allocated) * Decimal("100")), 1) if allocated > 0 else 0.0
        budget_utilization = {
            "allocated": float(allocated),
            "spent": float(spent),
            "remaining": float(remaining),
            "percentage": pct,
            "status": "exceeded" if pct >= 100 else ("warning" if pct >= 80 else "healthy"),
        }
    else:
        budget_utilization = {
            "allocated": 0.0,
            "spent": float(period_expenses),
            "remaining": 0.0,
            "percentage": 0.0,
            "status": "unconfigured",
        }

    # Recent transactions (combine last 8 from period or overall)
    recent_incomes = list(
        Income.objects.filter(user=user, date__range=(period_start, period_end))
        .select_related("category")
        .order_by("-date", "-created_at")[:6]
    )
    recent_expenses = list(
        Expense.objects.filter(user=user, date__range=(period_start, period_end))
        .select_related("category")
        .order_by("-date", "-created_at")[:6]
    )
    combined = []
    for inc in recent_incomes:
        combined.append(
            {
                "id": inc.id,
                "type": "income",
                "category": inc.category.name,
                "category_color": inc.category.color,
                "amount": float(inc.amount),
                "date": inc.date.isoformat(),
                "payment_method": inc.payment_method,
                "description": inc.description or inc.category.name,
                "created_at": inc.created_at.isoformat(),
            }
        )
    for exp in recent_expenses:
        combined.append(
            {
                "id": exp.id,
                "type": "expense",
                "category": exp.category.name,
                "category_color": exp.category.color,
                "amount": float(exp.amount),
                "date": exp.date.isoformat(),
                "payment_method": exp.payment_method,
                "description": exp.description or exp.category.name,
                "created_at": exp.created_at.isoformat(),
            }
        )
    combined.sort(key=lambda x: (x["date"], x["created_at"]), reverse=True)
    recent_transactions = combined[:8]

    income_vs_expense = get_income_expense_series(
        user,
        months=6,
        start_date=start_date,
        end_date=end_date,
    )
    expense_breakdown = get_category_breakdown(user, period_start, period_end, "expense")

    # Daily spending trend for the active period
    daily_rows = (
        Expense.objects.filter(user=user, date__range=(period_start, period_end))
        .values("date")
        .annotate(total=Sum("amount"))
        .order_by("date")
    )
    spending_trends = [
        {"date": r["date"].strftime("%d %b"), "amount": float(r["total"])} for r in daily_rows
    ]

    goals = SavingsGoal.objects.filter(user=user).prefetch_related("contributions")[:5]
    savings_progress = []
    for g in goals:
        gm = calculate_goal_metrics(g)
        savings_progress.append(
            {
                "id": g.id,
                "title": g.title,
                "target_amount": float(g.target_amount),
                "saved_amount": float(gm["saved_amount"]),
                "remaining_amount": float(gm["remaining_amount"]),
                "progress_percentage": gm["progress_percentage"],
                "status": g.status,
                "target_date": g.target_date.isoformat() if g.target_date else None,
            }
        )

    unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

    return {
        "period": {
            "start_date": period_start.isoformat(),
            "end_date": period_end.isoformat(),
            "month": target_month,
            "year": target_year,
        },
        "overview": {
            "total_balance": float(total_balance),
            "total_income": float(period_income),
            "total_expenses": float(period_expenses),
            "total_savings": float(total_savings),
            "net_period_cashflow": float(period_income - period_expenses),
            "budget_utilization": budget_utilization,
        },
        "recent_transactions": recent_transactions,
        "income_vs_expense_chart": income_vs_expense,
        "expense_category_breakdown": expense_breakdown,
        "monthly_spending_trends": spending_trends,
        "savings_progress": savings_progress,
        "unread_notifications_count": unread_notifications,
    }


def get_budget_performance(user, month, year):
    """Compare budgeted vs actual spending for all budgets in a given month/year."""
    budgets = Budget.objects.filter(user=user, month=month, year=year).select_related("category")
    performance = []
    for b in budgets:
        metrics = calculate_budget_metrics(b)
        performance.append(
            {
                "category": b.category.name if b.category else "Overall Monthly",
                "budgeted": float(b.amount),
                "spent": float(metrics["spent_amount"]),
                "remaining": float(metrics["remaining_amount"]),
                "utilization_percentage": metrics["utilization_percentage"],
                "status": metrics["status"],
            }
        )
    return performance


@transaction.atomic
def seed_demo_data_for_user(user):
    """Populate realistic sample records ONLY when explicitly invoked in a demo workflow."""
    ensure_default_categories()
    today = date.today()
    inc_cats = {c.name: c for c in Category.objects.filter(type="income")}
    exp_cats = {c.name: c for c in Category.objects.filter(type="expense")}

    # Create 4 months of realistic income & expenses
    for offset in range(3, -1, -1):
        m = today.month - offset
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        d1 = date(y, m, 1)
        d5 = date(y, m, 5)
        d10 = date(y, m, 10)
        d14 = date(y, m, 14)
        d18 = date(y, m, 18)
        d22 = date(y, m, min(22, 28))

        Income.objects.create(
            user=user,
            category=inc_cats["Salary"],
            amount=Decimal("78000.00"),
            date=d1,
            payment_method="Bank Transfer",
            description="Monthly Software Engineering Salary",
        )
        Income.objects.create(
            user=user,
            category=inc_cats["Freelancing"],
            amount=Decimal("14500.00") if offset % 2 == 0 else Decimal("9500.00"),
            date=d14,
            payment_method="Bank Transfer",
            description="UI Consulting Retainer",
        )
        Expense.objects.create(
            user=user,
            category=exp_cats["Housing"],
            amount=Decimal("18500.00"),
            date=d5,
            payment_method="Bank Transfer",
            description="Monthly Apartment Rent",
        )
        Expense.objects.create(
            user=user,
            category=exp_cats["Food"],
            amount=Decimal("4200.00") if offset == 0 else Decimal("5100.00"),
            date=d10,
            payment_method="UPI",
            description="Groceries & Dining",
        )
        Expense.objects.create(
            user=user,
            category=exp_cats["Bills"],
            amount=Decimal("3150.00"),
            date=d14,
            payment_method="UPI",
            description="Electricity, Fiber Broadband & Mobile",
        )
        Expense.objects.create(
            user=user,
            category=exp_cats["Transportation"],
            amount=Decimal("2400.00"),
            date=d18,
            payment_method="Card",
            description="Metro Pass & Cab Commutes",
        )
        Expense.objects.create(
            user=user,
            category=exp_cats["Shopping"],
            amount=Decimal("3800.00"),
            date=d22,
            payment_method="Card",
            description="Household & Apparel Essentials",
        )

    # Current month budgets
    Budget.objects.get_or_create(
        user=user,
        category=None,
        month=today.month,
        year=today.year,
        defaults={"amount": Decimal("45000.00"), "alert_threshold": 80},
    )
    Budget.objects.get_or_create(
        user=user,
        category=exp_cats["Food"],
        month=today.month,
        year=today.year,
        defaults={"amount": Decimal("5000.00"), "alert_threshold": 80},
    )
    Budget.objects.get_or_create(
        user=user,
        category=exp_cats["Shopping"],
        month=today.month,
        year=today.year,
        defaults={"amount": Decimal("6000.00"), "alert_threshold": 80},
    )
    Budget.objects.get_or_create(
        user=user,
        category=exp_cats["Transportation"],
        month=today.month,
        year=today.year,
        defaults={"amount": Decimal("3500.00"), "alert_threshold": 80},
    )

    # Savings goals & contributions
    laptop_goal = SavingsGoal.objects.create(
        user=user,
        title="Buy a Laptop",
        target_amount=Decimal("60000.00"),
        target_date=today + timedelta(days=120),
        description="Workstation upgrade for development projects",
    )
    record_savings_contribution(
        laptop_goal, user, Decimal("25000.00"), today - timedelta(days=12), "Initial transfer"
    )

    emergency_goal = SavingsGoal.objects.create(
        user=user,
        title="Emergency Reserve Fund",
        target_amount=Decimal("150000.00"),
        target_date=today + timedelta(days=270),
        description="Six-month liquidity cushion",
    )
    record_savings_contribution(
        emergency_goal, user, Decimal("65000.00"), today - timedelta(days=25), "Quarterly bonus"
    )
