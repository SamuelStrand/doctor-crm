from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from accounts.models import User, UserRole
from .models import (
    Patient, Service, Room,
    DoctorSchedule, DoctorTimeOff,
    Appointment, VisitNote, Attachment
)


def _raise_drf_validation(e: DjangoValidationError):
    # преобразуем django ValidationError в DRF ValidationError
    if hasattr(e, "message_dict"):
        raise serializers.ValidationError(e.message_dict)
    raise serializers.ValidationError(e.messages)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"


class DoctorScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSchedule
        fields = ("id", "weekday", "start_time", "end_time", "slot_minutes")


class DoctorTimeOffSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorTimeOff
        fields = ("id", "start_at", "end_at", "reason")


class AppointmentAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = (
            "id",
            "patient",
            "doctor",
            "service",
            "room",
            "start_at",
            "end_at",
            "status",
            "created_by",
            "reason",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_by", "created_at", "updated_at")

    def validate_doctor(self, doctor: User):
        if doctor.role != UserRole.DOCTOR:
            raise serializers.ValidationError("Selected user is not a doctor.")
        return doctor

    def create(self, validated_data):
        instance = Appointment(**validated_data)
        try:
            instance.full_clean()
        except DjangoValidationError as e:
            _raise_drf_validation(e)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for k, v in validated_data.items():
            setattr(instance, k, v)
        try:
            instance.full_clean()
        except DjangoValidationError as e:
            _raise_drf_validation(e)
        instance.save()
        return instance


class AppointmentDoctorSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    service_code = serializers.CharField(source="service.code", read_only=True)

    class Meta:
        model = Appointment
        fields = (
        "id", "start_at", "end_at", "status", "reason", "comment", "patient", "patient_name", "service", "service_code",
        "room")
        read_only_fields = ("patient", "service", "room", "start_at", "end_at", "patient_name", "service_code")

    def get_patient_name(self, obj):
        return str(obj.patient)


class VisitNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitNote
        fields = ("id", "appointment", "patient", "doctor", "note_text", "created_at", "updated_at")
        read_only_fields = ("patient", "doctor", "created_at", "updated_at")

    def create(self, validated_data):
        instance = VisitNote(**validated_data)
        try:
            instance.full_clean()
        except DjangoValidationError as e:
            _raise_drf_validation(e)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for k, v in validated_data.items():
            setattr(instance, k, v)
        try:
            instance.full_clean()
        except DjangoValidationError as e:
            _raise_drf_validation(e)
        instance.save()
        return instance

    def validate_appointment(self, appointment: Appointment):
        request = self.context.get("request")
        if request and request.user and appointment.doctor_id != request.user.id:
            raise serializers.ValidationError("You can create notes only for your own appointments.")
        return appointment


class AttachmentSerializer(serializers.ModelSerializer):
    visit_note = serializers.IntegerField(source="visit_note_id", read_only=True)

    class Meta:
        model = Attachment
        fields = ("id", "visit_note", "file", "uploaded_by", "uploaded_at")
        read_only_fields = ("uploaded_by", "uploaded_at")


class PatientShortSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="__str__", read_only=True)

    class Meta:
        model = Patient
        fields = ("id", "full_name", "phone", "email", "birth_date", "gender")


class AppointmentHistorySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.__str__", read_only=True)
    service_code = serializers.CharField(source="service.code", read_only=True)

    class Meta:
        model = Appointment
        fields = (
            "id",
            "start_at",
            "end_at",
            "status",
            "patient_id",
            "patient_name",
            "service_id",
            "service_code",
            "room_id",
            "reason",
        )


class VisitNoteHistorySerializer(serializers.ModelSerializer):
    appointment_id = serializers.IntegerField(source="appointment.id", read_only=True)

    class Meta:
        model = VisitNote
        fields = ("id", "appointment_id", "note_text", "created_at", "updated_at")
