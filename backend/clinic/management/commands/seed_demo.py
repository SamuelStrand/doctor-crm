from __future__ import annotations

import random
from datetime import timedelta, time

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User, UserRole, DoctorProfile
from clinic.models import Patient, Service, Room, DoctorSchedule, Appointment, AppointmentStatus
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


def _rand_phone():
    return "+7" + "".join(random.choice("0123456789") for _ in range(10))


FIRST_NAMES = ["Emil", "Sofiya", "Ali", "Dias", "Aigerim", "Miras", "Nur", "Sanzhar", "Zarina", "Asel"]
LAST_NAMES = ["Kalimullin", "Roganskaya", "Ivanov", "Kim", "Omarov", "Bekov", "Tulegenov", "Kassym", "Akhmetov", "Lee"]


class Command(BaseCommand):
    help = "Seed demo data: admin, doctors, patients, services, rooms, schedules, appointments."

    def add_arguments(self, parser):
        parser.add_argument("--admin-email", default="admin@clinic.local")
        parser.add_argument("--admin-password", default="Admin123!")
        parser.add_argument("--doctors", type=int, default=2)
        parser.add_argument("--patients", type=int, default=20)
        parser.add_argument("--days", type=int, default=7)

    @transaction.atomic
    def handle(self, *args, **opts):
        admin_email = opts["admin_email"]
        admin_password = opts["admin_password"]
        doctors_n = opts["doctors"]
        patients_n = opts["patients"]
        days = opts["days"]

        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                "role": UserRole.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "first_name": "Clinic",
                "last_name": "Admin",
            },
        )
        if created:
            admin_user.set_password(admin_password)
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin: {admin_email} / {admin_password}"))
        else:
            self.stdout.write(self.style.WARNING(f"Admin already exists: {admin_email}"))

        doctors = []
        for i in range(doctors_n):
            email = f"doctor{i+1}@clinic.local"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "role": UserRole.DOCTOR,
                    "is_active": True,
                    "first_name": f"Doctor{i+1}",
                    "last_name": "User",
                },
            )
            if created:
                user.set_password("Doctor123!")
                user.save()

            prof, _ = DoctorProfile.objects.get_or_create(user=user, defaults={"full_name": user.full_name})
            if not prof.specialization:
                prof.specialization = random.choice(["Therapist", "Dentist", "Cardiologist", "Dermatologist"])
                prof.phone = _rand_phone()
                prof.save()

            doctors.append(user)

        self.stdout.write(self.style.SUCCESS(
            f"Doctors ready: {', '.join(d.email for d in doctors)} (password: Doctor123!)"
        ))

        rooms = []
        for name in ["101", "102", "201"]:
            room, _ = Room.objects.get_or_create(name=name, defaults={"floor": int(name[0])})
            rooms.append(room)

        services_data = [
            ("CONSULT", "Consultation", "Консультация", "Кеңес беру", 30, 10000),
            ("DENT", "Dental check", "Осмотр стоматолога", "Тіс дәрігері тексеруі", 40, 15000),
            ("ECG", "ECG", "ЭКГ", "ЭКГ", 20, 8000),
        ]
        services = []
        for code, en, ru, kk, dur, price in services_data:
            s, _ = Service.objects.get_or_create(
                code=code,
                defaults={
                    "name_en": en,
                    "name_ru": ru,
                    "name_kk": kk,
                    "duration_minutes": dur,
                    "price": price,
                },
            )
            services.append(s)

        patients = []
        for _ in range(patients_n):
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            p = Patient.objects.create(
                first_name=fn,
                last_name=ln,
                middle_name="",
                phone=_rand_phone(),
                email=f"{fn.lower()}.{ln.lower()}{random.randint(1,999)}@mail.local",
            )
            patients.append(p)

        for d in doctors:
            for wd in range(0, 5):
                DoctorSchedule.objects.get_or_create(
                    doctor=d, weekday=wd,
                    start_time=time(9, 0), end_time=time(13, 0),
                    defaults={"slot_minutes": 30},
                )
                DoctorSchedule.objects.get_or_create(
                    doctor=d, weekday=wd,
                    start_time=time(14, 0), end_time=time(18, 0),
                    defaults={"slot_minutes": 30},
                )

        now = timezone.now()
        created_count = 0

        for day in range(days):
            day_start = (now + timedelta(days=day)).replace(hour=9, minute=0, second=0, microsecond=0)

            for d in doctors:
                for _ in range(random.randint(2, 4)):
                    service = random.choice(services)
                    patient = random.choice(patients)

                    start = day_start + timedelta(minutes=30 * random.randint(0, 12))
                    end = start + timedelta(minutes=service.duration_minutes)

                    appt = Appointment(
                        patient=patient,
                        doctor=d,
                        service=service,
                        room=random.choice(rooms),
                        start_at=start,
                        end_at=end,
                        status=AppointmentStatus.SCHEDULED,
                        created_by=admin_user,
                        reason="Demo appointment",
                    )
                    try:
                        appt.save()
                        created_count += 1
                    except Exception:
                        continue

        self.stdout.write(self.style.SUCCESS(f"Seed complete. Created appointments: {created_count}"))
