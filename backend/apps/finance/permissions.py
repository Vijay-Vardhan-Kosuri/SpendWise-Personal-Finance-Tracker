"""Object-level ownership permissions."""
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Ensures users can access or mutate only their own financial records."""

    def has_object_permission(self, request, view, obj):
        return getattr(obj, "user_id", None) == request.user.id
