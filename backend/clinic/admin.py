from django.contrib import admin
from .models import Patient, Service, Room, DoctorSchedule, DoctorTimeOff, Appointment


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "last_name", "first_name", "phone", "email", "birth_date")
    search_fields = ("first_name", "last_name", "middle_name", "phone", "email")
    list_filter = ("gender",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("code", "name_en", "duration_minutes", "price", "is_active")
    search_fields = ("code", "name_en", "name_ru", "name_kk")
    list_filter = ("is_active",)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name", "floor")
    search_fields = ("name",)


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ("doctor", "weekday", "start_time", "end_time", "slot_minutes")
    list_filter = ("weekday",)
    search_fields = ("doctor__email",)


@admin.register(DoctorTimeOff)
class DoctorTimeOffAdmin(admin.ModelAdmin):
    list_display = ("doctor", "start_at", "end_at", "reason")
    search_fields = ("doctor__email", "reason")
    list_filter = ("doctor",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "doctor", "service", "start_at", "end_at", "status")
    search_fields = ("patient__first_name", "patient__last_name", "doctor__email", "service__code")
    list_filter = ("status", "doctor")
    autocomplete_fields = ("patient", "doctor", "service", "room")
