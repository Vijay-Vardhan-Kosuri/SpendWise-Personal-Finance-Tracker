"""Root URL configuration for SpendWise API."""
from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse


def health_check(_request):
    return JsonResponse({"status": "ok", "service": "SpendWise API"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="api-health"),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.finance.urls")),
]
