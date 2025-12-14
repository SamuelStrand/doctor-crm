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



class DoctorAppointmentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = AppointmentDoctorSerializer
    permission_classes = [IsDoctorRole]

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
        serializer.save(doctor=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        log_action(request=request, action=AuditAction.READ, obj=obj, meta={"type": "visit_note"})
        return super().retrieve(request, *args, **kwargs)



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
