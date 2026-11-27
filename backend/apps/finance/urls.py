"""URL routing for SpendWise finance APIs."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.finance.views import (
    AnalyticsCategoriesView,
    AnalyticsIncomeExpenseView,
    AnalyticsMonthlyView,
    BudgetViewSet,
    CategoryListView,
    DashboardSummaryView,
    DemoSeedView,
    ExpenseViewSet,
    IncomeViewSet,
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
    SavingsGoalViewSet,
    UnifiedTransactionsView,
)

router = DefaultRouter()
router.register(r"income", IncomeViewSet, basename="income")
router.register(r"expenses", ExpenseViewSet, basename="expenses")
router.register(r"budgets", BudgetViewSet, basename="budgets")
router.register(r"savings", SavingsGoalViewSet, basename="savings")

urlpatterns = [
    path("", include(router.urls)),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("transactions/", UnifiedTransactionsView.as_view(), name="unified-transactions"),
    path("analytics/monthly/", AnalyticsMonthlyView.as_view(), name="analytics-monthly"),
    path("analytics/categories/", AnalyticsCategoriesView.as_view(), name="analytics-categories"),
    path(
        "analytics/income-expense/",
        AnalyticsIncomeExpenseView.as_view(),
        name="analytics-income-expense",
    ),
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path(
        "notifications/<int:pk>/read/",
        NotificationMarkReadView.as_view(),
        name="notification-mark-read",
    ),
    path(
        "notifications/mark-all-read/",
        NotificationMarkAllReadView.as_view(),
        name="notification-mark-all-read",
    ),
    path("demo/seed/", DemoSeedView.as_view(), name="demo-seed"),
]
