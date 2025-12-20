from rest_framework import viewsets
from core.permissions import IsAdminRole
from .models import Patient, Service, Room, Appointment
from .serializers import PatientSerializer, ServiceSerializer, RoomSerializer, AppointmentAdminSerializer
from audit.utils import log_action
from audit.models import AuditAction
from .filters import AppointmentFilter


class AdminPatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("-id")
    serializer_class = PatientSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("first_name", "last_name", "middle_name", "phone", "email")

    def perform_create(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.CREATE, obj=obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.UPDATE, obj=obj)

    def perform_destroy(self, instance):
        log_action(request=self.request, action=AuditAction.DELETE, obj=instance)
        instance.delete()

class AdminServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("code")
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("code", "name_en", "name_ru", "name_kk")

    def perform_create(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.CREATE, obj=obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.UPDATE, obj=obj)

    def perform_destroy(self, instance):
        log_action(request=self.request, action=AuditAction.DELETE, obj=instance)
        instance.delete()

class AdminRoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by("name")
    serializer_class = RoomSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("name",)

    def perform_create(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.CREATE, obj=obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.UPDATE, obj=obj)

    def perform_destroy(self, instance):
        log_action(request=self.request, action=AuditAction.DELETE, obj=instance)
        instance.delete()

class AdminAppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor", "service", "room").all().order_by("-start_at")
    serializer_class = AppointmentAdminSerializer
    permission_classes = [IsAdminRole]
    search_fields = (
        "reason",
        "comment",
        "patient__first_name",
        "patient__last_name",
        "patient__id",
        "doctor__email",
        "doctor__id",
        "service__code",
    )
    filterset_class = AppointmentFilter
    ordering_fields = ("start_at", "end_at", "status")
    ordering = ("-start_at",)
    def perform_create(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.CREATE, obj=obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        log_action(request=self.request, action=AuditAction.UPDATE, obj=obj)

    def perform_destroy(self, instance):
        log_action(request=self.request, action=AuditAction.DELETE, obj=instance)
        instance.delete()