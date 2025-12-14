from rest_framework import viewsets
from core.permissions import IsAdminRole
from .models import Patient, Service, Room, Appointment
from .serializers import PatientSerializer, ServiceSerializer, RoomSerializer, AppointmentAdminSerializer


class AdminPatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("-id")
    serializer_class = PatientSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("first_name", "last_name", "middle_name", "phone", "email")


class AdminServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("code")
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("code", "name_en", "name_ru", "name_kk")


class AdminRoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by("name")
    serializer_class = RoomSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("name",)


class AdminAppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor", "service", "room").all().order_by("-start_at")
    serializer_class = AppointmentAdminSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("patient__first_name", "patient__last_name", "doctor__email", "service__code")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
