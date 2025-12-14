from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source="actor.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "created_at",
            "action",
            "actor",
            "actor_email",
            "object_type",
            "object_id",
            "ip",
            "user_agent",
            "meta",
        )
