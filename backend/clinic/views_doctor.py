from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from core.permissions import IsDoctorRole
from .models import Appointment, VisitNote, DoctorSchedule, DoctorTimeOff
from .serializers import (
    AppointmentDoctorSerializer,
    VisitNoteSerializer,
    DoctorScheduleSerializer,
    DoctorTimeOffSerializer,
)

from audit.utils import log_action
from audit.models import AuditAction

from rest_framework.parsers import MultiPartParser, FormParser
from clinic.models import Attachment
from clinic.serializers import AttachmentSerializer

from .filters import AppointmentFilter

from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from clinic.models import Patient
from clinic.serializers import PatientShortSerializer, AppointmentHistorySerializer, VisitNoteHistorySerializer



class DoctorAppointmentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = AppointmentDoctorSerializer
    permission_classes = [IsDoctorRole]
    filterset_class = AppointmentFilter
    ordering_fields = ("start_at", "end_at", "status")
    ordering = ("-start_at",)
    search_fields = (
        "id",
        "reason",
        "comment",
        "patient__first_name",
        "patient__last_name",
        "patient__phone",
        "service__code",
        "service__name_en",
        "service__name_ru",
        "service__name_kk",
        "room__name",
    )

    def get_queryset(self):
        return Appointment.objects.select_related("patient", "service", "room").filter(doctor=self.request.user).order_by("-start_at")

    @action(detail=True, methods=["post"])
    def set_status(self, request, pk=None):
        appt = self.get_object()
        new_status = request.data.get("status")
        if not new_status:
            return Response({"status": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        appt.status = new_status
        try:
            appt.save()  # model сам проверит переходы статусов
        except DjangoValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AppointmentDoctorSerializer(appt).data)


class DoctorVisitNoteViewSet(viewsets.ModelViewSet):
    serializer_class = VisitNoteSerializer
    permission_classes = [IsDoctorRole]

    def get_queryset(self):
        return VisitNote.objects.select_related("appointment", "patient").filter(doctor=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        appt = serializer.validated_data["appointment"]

        if appt.doctor_id != self.request.user.id:
            raise DjangoValidationError("You can create a note only for your own appointment.")

        serializer.save(
            doctor=self.request.user,
            patient=appt.patient,
        )


    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        log_action(request=request, action=AuditAction.READ, obj=obj, meta={"type": "visit_note"})
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=["get", "post"], parser_classes=[MultiPartParser, FormParser])
    def attachments(self, request, pk=None):

        note = self.get_object()

        if request.method == "GET":
            qs = note.attachments.all().order_by("-uploaded_at")
            return Response(AttachmentSerializer(qs, many=True, context={"request": request}).data)

        ser = AttachmentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        att = ser.save(visit_note=note, uploaded_by=request.user)

        log_action(
            request=request,
            action=AuditAction.CREATE,
            obj=att,
            meta={"type": "attachment_upload", "visit_note_id": note.id},
        )

        return Response(AttachmentSerializer(att, context={"request": request}).data, status=201)

    @action(detail=True, methods=["delete"], url_path=r"attachments/(?P<attachment_id>\d+)")
    def delete_attachment(self, request, pk=None, attachment_id=None):
        note = self.get_object()
        att = note.attachments.filter(pk=attachment_id).first()
        if not att:
            return Response({"detail": "Attachment not found."}, status=404)

        log_action(
            request=request,
            action=AuditAction.DELETE,
            obj=att,
            meta={"type": "attachment_delete", "visit_note_id": note.id},
        )
        att.delete()
        return Response(status=204)



class DoctorScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorScheduleSerializer
    permission_classes = [IsDoctorRole]

    def get_queryset(self):
        return DoctorSchedule.objects.filter(doctor=self.request.user).order_by("weekday", "start_time")

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)


class DoctorTimeOffViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorTimeOffSerializer
    permission_classes = [IsDoctorRole]

    def get_queryset(self):
        return DoctorTimeOff.objects.filter(doctor=self.request.user).order_by("-start_at")

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)

class DoctorPatientViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    Doctor can see ONLY patients linked to them via appointments.
    """
    serializer_class = PatientShortSerializer
    permission_classes = [IsDoctorRole]
    search_fields = ("first_name", "last_name", "middle_name", "phone", "email")

    def get_queryset(self):
        return (
            Patient.objects.filter(appointments__doctor=self.request.user)
            .distinct()
            .order_by("last_name", "first_name")
        )

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        patient = self.get_object()

        # audit read
        log_action(request=request, action=AuditAction.READ, obj=patient, meta={"type": "patient_history"})

        appointments = (
            Appointment.objects.select_related("service", "room", "patient")
            .filter(doctor=request.user, patient=patient)
            .order_by("-start_at")
        )

        notes = (
            VisitNote.objects.filter(doctor=request.user, patient=patient)
            .select_related("appointment")
            .order_by("-created_at")
        )

        return Response({
            "patient": PatientShortSerializer(patient).data,
            "appointments": AppointmentHistorySerializer(appointments, many=True).data,
            "visit_notes": VisitNoteHistorySerializer(notes, many=True).data,
        })
