from django.contrib import admin
from apps.accounts.models import PasswordResetToken, RevokedToken, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "full_name", "currency_preference", "is_active", "created_at")
    search_fields = ("email", "full_name")


admin.site.register(PasswordResetToken)
admin.site.register(RevokedToken)
