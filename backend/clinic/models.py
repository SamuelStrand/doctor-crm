from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class Gender(models.TextChoices):
    MALE = "M", _("Male")
    FEMALE = "F", _("Female")
    OTHER = "O", _("Other")
    UNKNOWN = "U", _("Unknown")


class AppointmentStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", _("Scheduled")
    CONFIRMED = "CONFIRMED", _("Confirmed")
    COMPLETED = "COMPLETED", _("Completed")
    CANCELLED = "CANCELLED", _("Cancelled")
    NO_SHOW = "NO_SHOW", _("No-show")


ACTIVE_APPOINTMENT_STATUSES = (
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
)


class Patient(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)

    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, default=Gender.UNKNOWN)

    phone = models.CharField(max_length=32, blank=True, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    address = models.CharField(max_length=255, blank=True)

    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["last_name", "first_name"])]

    def __str__(self) -> str:
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()


class Service(models.Model):
    code = models.CharField(max_length=50, unique=True)

    name_en = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True)
    name_kk = models.CharField(max_length=255, blank=True)

    description_en = models.TextField(blank=True)
    description_ru = models.TextField(blank=True)
    description_kk = models.TextField(blank=True)

    duration_minutes = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"{self.code}: {self.name_en}"


class Room(models.Model):
    name = models.CharField(max_length=64, unique=True)  # "101"
    floor = models.IntegerField(blank=True, null=True)
    comment = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return self.name


class DoctorSchedule(models.Model):
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="schedules")
    weekday = models.PositiveSmallIntegerField(help_text=_("0=Mon ... 6=Sun"))
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_minutes = models.PositiveSmallIntegerField(default=30)

    class Meta:
        unique_together = ("doctor", "weekday", "start_time", "end_time")

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError({"end_time": "end_time must be after start_time"})
        if self.weekday > 6:
            raise ValidationError({"weekday": "weekday must be in 0..6"})


class DoctorTimeOff(models.Model):
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="time_offs")
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)

    def clean(self):
        if self.start_at >= self.end_at:
            raise ValidationError({"end_at": "end_at must be after start_at"})


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="appointments")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointments")

    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField(db_index=True)

    status = models.CharField(max_length=20, choices=AppointmentStatus.choices, default=AppointmentStatus.SCHEDULED)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_appointments",
    )
    reason = models.CharField(max_length=255, blank=True)
    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["doctor", "start_at"]),
            models.Index(fields=["patient", "start_at"]),
        ]

    def clean(self):
        if self.start_at >= self.end_at:
            raise ValidationError({"end_at": "end_at must be after start_at"})

        # базовая защита от пересечений (полноценно докрутим на этапе 5)
        qs = Appointment.objects.filter(
            doctor=self.doctor,
            status__in=ACTIVE_APPOINTMENT_STATUSES,
            start_at__lt=self.end_at,
            end_at__gt=self.start_at,
        )
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        if qs.exists():
            raise ValidationError("Appointment overlaps with another active appointment for this doctor.")


class VisitNote(models.Model):
    # медданные — потом в API запретим для admin
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="visit_note")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="visit_notes")
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="visit_notes")

    note_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.appointment_id:
            self.patient_id = self.appointment.patient_id
            self.doctor_id = self.appointment.doctor_id
        super().save(*args, **kwargs)


def attachment_upload_path(instance: "Attachment", filename: str) -> str:
    return f"visit_notes/{instance.visit_note_id}/{filename}"


class Attachment(models.Model):
    visit_note = models.ForeignKey(VisitNote, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to=attachment_upload_path)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
