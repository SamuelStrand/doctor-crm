import django_filters
from .models import Appointment


class AppointmentFilter(django_filters.FilterSet):
    date_from = django_filters.IsoDateTimeFilter(field_name="start_at", lookup_expr="gte")
    date_to = django_filters.IsoDateTimeFilter(field_name="start_at", lookup_expr="lte")
    doctor = django_filters.NumberFilter(field_name="doctor_id")
    patient = django_filters.NumberFilter(field_name="patient_id")
    status = django_filters.CharFilter(field_name="status")

    class Meta:
        model = Appointment
        fields = ("doctor", "patient", "status", "date_from", "date_to")
