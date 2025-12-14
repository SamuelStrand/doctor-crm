def _get_ip(request) -> str:
    return request.META.get("REMOTE_ADDR", "") if request else ""


def _get_user_agent(request) -> str:
    return request.META.get("HTTP_USER_AGENT", "") if request else ""


def log_action(*, request, action: str, obj=None, meta: dict | None = None):
    from audit.models import AuditLog

    actor = getattr(request, "user", None)
    if not actor or not getattr(actor, "is_authenticated", False):
        actor = None

    object_type = ""
    object_id = ""

    if obj is not None:
        object_type = f"{obj._meta.app_label}.{obj.__class__.__name__}"
        object_id = str(getattr(obj, "pk", ""))

    AuditLog.objects.create(
        actor=actor,
        action=action,
        object_type=object_type,
        object_id=object_id,
        ip=_get_ip(request),
        user_agent=_get_user_agent(request),
        meta=meta or {},
    )
