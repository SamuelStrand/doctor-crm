from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserRole
from clinic.models import Patient, Service, Appointment


def _lang(request) -> str:
    header = (request.headers.get("Accept-Language") or "").lower()
    if header.startswith("ru"):
        return "ru"
    if header.startswith("kk"):
        return "kk"
    return "en"


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        if not q:
            return Response({"detail": "Query param 'q' is required."}, status=400)

        lang = _lang(request)
        limit = min(int(request.query_params.get("limit", 10)), 50)

        is_admin = request.user.role == UserRole.ADMIN
        is_doctor = request.user.role == UserRole.DOCTOR

        data = {}

        patients_qs = Patient.objects.all()
        if is_doctor:
            # только пациенты этого доктора (через appointments)
            patients_qs = patients_qs.filter(appointments__doctor=request.user).distinct()

        patients_qs = patients_qs.filter(
            Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(middle_name__icontains=q)
            | Q(phone__icontains=q)
            | Q(email__icontains=q)
        ).order_by("last_name", "first_name")[:limit]

        data["patients"] = [
            {
                "id": p.id,
                "full_name": str(p),
                "phone": p.phone,
                "email": p.email,
            }
            for p in patients_qs
        ]

        services_qs = Service.objects.filter(is_active=True).filter(
            Q(code__icontains=q)
            | Q(name_en__icontains=q)
            | Q(name_ru__icontains=q)
            | Q(name_kk__icontains=q)
        ).order_by("code")[:limit]

        def service_name(s: Service):
            return getattr(s, f"name_{lang}") or s.name_en

        data["services"] = [
            {
                "id": s.id,
                "code": s.code,
                "name": service_name(s),
                "duration_minutes": s.duration_minutes,
                "price": str(s.price),
            }
            for s in services_qs
        ]

        appt_qs = Appointment.objects.select_related("patient", "doctor", "service").all()
        if is_doctor:
            appt_qs = appt_qs.filter(doctor=request.user)

        appt_qs = appt_qs.filter(
            Q(patient__first_name__icontains=q)
            | Q(patient__last_name__icontains=q)
            | Q(doctor__email__icontains=q)
            | Q(service__code__icontains=q)
        ).order_by("-start_at")[:limit]

        data["appointments"] = [
            {
                "id": a.id,
                "start_at": a.start_at,
                "end_at": a.end_at,
                "status": a.status,
                "patient_id": a.patient_id,
                "patient_name": str(a.patient),
                "doctor_email": a.doctor.email,
                "service_code": a.service.code,
            }
            for a in appt_qs
        ]

        return Response(data)
