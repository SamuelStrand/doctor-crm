from rest_framework.views import APIView
from rest_framework.response import Response

from core.permissions import IsDoctorRole
from audit.utils import log_action
from audit.models import AuditAction

from clinic.models import Patient, VisitNote, Appointment
from .serializers import NoteDraftSerializer, PatientSummarySerializer


HEADERS = {
    "en": {
        "title": "Visit note draft",
        "complaints": "Complaints",
        "history": "History",
        "assessment": "Assessment",
        "plan": "Plan",
    },
    "ru": {
        "title": "Черновик заметки визита",
        "complaints": "Жалобы",
        "history": "Анамнез/История",
        "assessment": "Оценка/Диагноз",
        "plan": "План лечения",
    },
    "kk": {
        "title": "Қабылдау жазбасының жобасы",
        "complaints": "Шағымдар",
        "history": "Анамнез/Тарих",
        "assessment": "Бағалау/Диагноз",
        "plan": "Ем жоспары",
    },
}


class NoteDraftView(APIView):
    permission_classes = [IsDoctorRole]

    def post(self, request):
        ser = NoteDraftSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        lang = ser.validated_data.get("language", "en")

        bullets = ser.validated_data.get("bullets") or []
        free_text = (ser.validated_data.get("free_text") or "").strip()

        h = HEADERS.get(lang, HEADERS["en"])

        lines = []
        lines.append(f"{h['title']}\n")
        lines.append(f"{h['complaints']}:")
        if bullets:
            for b in bullets:
                lines.append(f"- {b.strip()}")
        else:
            lines.append("- (not provided)" if lang == "en" else "- (не указано)" if lang == "ru" else "- (көрсетілмеген)")

        lines.append("")
        lines.append(f"{h['history']}:")
        lines.append(free_text if free_text else ("(not provided)" if lang == "en" else "(не указано)" if lang == "ru" else "(көрсетілмеген)"))

        lines.append("")
        lines.append(f"{h['assessment']}:")
        lines.append("—")

        lines.append("")
        lines.append(f"{h['plan']}:")
        lines.append("—")

        draft = "\n".join(lines)

        log_action(request=request, action=AuditAction.CREATE, obj=None, meta={"type": "ai_note_draft"})
        return Response({"draft": draft})


class PatientSummaryView(APIView):
    permission_classes = [IsDoctorRole]

    def post(self, request):
        ser = PatientSummarySerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        patient_id = ser.validated_data["patient_id"]
        limit = ser.validated_data["limit"]
        lang = ser.validated_data.get("language", "en")

        has_link = Appointment.objects.filter(doctor=request.user, patient_id=patient_id).exists()
        if not has_link:
            return Response({"detail": "You have no access to this patient."}, status=403)

        patient = Patient.objects.get(pk=patient_id)

        notes = (
            VisitNote.objects.filter(doctor=request.user, patient_id=patient_id)
            .order_by("-created_at")[:limit]
        )

        items = []
        for n in notes:
            txt = (n.note_text or "").strip().replace("\n", " ")
            snippet = txt[:160] + ("..." if len(txt) > 160 else "")
            items.append({
                "date": n.created_at.date(),
                "appointment_id": n.appointment_id,
                "snippet": snippet
            })

        title = {
            "en": f"Summary for {patient}",
            "ru": f"Краткая история пациента: {patient}",
            "kk": f"Пациент қысқаша тарихы: {patient}",
        }.get(lang, f"Summary for {patient}")

        log_action(request=request, action=AuditAction.READ, obj=patient, meta={"type": "ai_patient_summary"})
        return Response({"title": title, "items": items})
