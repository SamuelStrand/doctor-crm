from django.conf import settings
from django.db import models


class AuditAction(models.TextChoices):
    CREATE = "CREATE", "Create"
    UPDATE = "UPDATE", "Update"
    DELETE = "DELETE", "Delete"
    READ = "READ", "Read"


class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )

    action = models.CharField(max_length=20, choices=AuditAction.choices)

    object_type = models.CharField(max_length=120, blank=True)
    object_id = models.CharField(max_length=64, blank=True)

    ip = models.CharField(max_length=64, blank=True)
    user_agent = models.TextField(blank=True)

    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["action", "created_at"]),
            models.Index(fields=["object_type", "object_id"]),
        ]

    def __str__(self):
        return f"{self.created_at} {self.action} {self.object_type}:{self.object_id}"
