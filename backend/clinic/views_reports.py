from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response

from core.permissions import IsAdminRole
from clinic.models import Appointment


class AdminAppointmentsReportView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        doctor_id = request.query_params.get("doctor")
        status = request.query_params.get("status")

        qs = Appointment.objects.select_related("doctor", "patient", "service").all()

        if date_from:
            qs = qs.filter(start_at__gte=date_from)
        if date_to:
            qs = qs.filter(start_at__lte=date_to)
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        if status:
            qs = qs.filter(status=status)

        by_status = list(
            qs.values("status").annotate(total=Count("id")).order_by("status")
        )
        by_doctor = list(
            qs.values("doctor_id", "doctor__email")
              .annotate(total=Count("id"))
              .order_by("-total")
        )

        total = qs.count()

        return Response({
            "filters": {
                "date_from": date_from,
                "date_to": date_to,
                "doctor": doctor_id,
                "status": status,
            },
            "total": total,
            "by_status": by_status,
            "by_doctor": by_doctor,
        })
