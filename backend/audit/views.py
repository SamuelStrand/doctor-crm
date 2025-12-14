from rest_framework import viewsets
from core.permissions import IsAdminRole
from .models import AuditLog
from .serializers import AuditLogSerializer


class AdminAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("actor").all().order_by("-created_at")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("actor__email", "object_type", "object_id", "ip")
    filterset_fields = ("action", "object_type")
