from django.contrib import admin
from apps.finance.models import (
    Budget,
    Category,
    Expense,
    Income,
    Notification,
    SavingsContribution,
    SavingsGoal,
)

admin.site.register(Category)
admin.site.register(Income)
admin.site.register(Expense)
admin.site.register(Budget)
admin.site.register(SavingsGoal)
admin.site.register(SavingsContribution)
admin.site.register(Notification)
