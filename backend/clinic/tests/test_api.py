from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User, UserRole
from clinic.models import Patient, Service, Room, DoctorSchedule, Appointment, VisitNote


def auth(client, user: User):
    token = AccessToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(token)}")


class DoctorCrmApiTests(APITestCase):
    def setUp(self):
        # users
        self.admin = User.objects.create_user(
            email="admin@test.local",
            password="Admin123!",
            role=UserRole.ADMIN,
            is_staff=True,
            is_active=True,
        )

        self.doctor1 = User.objects.create_user(
            email="doctor1@test.local",
            password="Doctor123!",
            role=UserRole.DOCTOR,
            is_active=True,
        )
        self.doctor2 = User.objects.create_user(
            email="doctor2@test.local",
            password="Doctor123!",
            role=UserRole.DOCTOR,
            is_active=True,
        )

        self.patient = Patient.objects.create(first_name="John", last_name="Doe", phone="+77000000000")
        self.service = Service.objects.create(code="CONSULT", name_en="Consultation", duration_minutes=30, price=10000)
        self.room = Room.objects.create(name="101", floor=1)

        wd = timezone.localtime(timezone.now()).weekday()
        DoctorSchedule.objects.create(doctor=self.doctor1, weekday=wd, start_time=timezone.datetime(2000,1,1,9,0).time(), end_time=timezone.datetime(2000,1,1,18,0).time(), slot_minutes=30)
        DoctorSchedule.objects.create(doctor=self.doctor2, weekday=wd, start_time=timezone.datetime(2000,1,1,9,0).time(), end_time=timezone.datetime(2000,1,1,18,0).time(), slot_minutes=30)

        start = timezone.now().replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        end = start + timedelta(minutes=30)

        self.appt1 = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor1,
            service=self.service,
            room=self.room,
            start_at=start,
            end_at=end,
            created_by=self.admin,
        )

        self.appt2 = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor2,
            service=self.service,
            room=self.room,
            start_at=start + timedelta(hours=2),
            end_at=end + timedelta(hours=2),
            created_by=self.admin,
        )

    def test_admin_can_list_patients(self):
        auth(self.client, self.admin)
        r = self.client.get("/api/admin/patients/")
        self.assertEqual(r.status_code, 200)

    def test_doctor_cannot_access_admin_patients(self):
        auth(self.client, self.doctor1)
        r = self.client.get("/api/admin/patients/")
        self.assertEqual(r.status_code, 403)

    def test_doctor_sees_only_own_appointments(self):
        auth(self.client, self.doctor1)
        r = self.client.get("/api/doctor/appointments/")
        self.assertEqual(r.status_code, 200)
        ids = [x["id"] for x in r.data["results"]] if "results" in r.data else [x["id"] for x in r.data]
        self.assertIn(self.appt1.id, ids)
        self.assertNotIn(self.appt2.id, ids)

    def test_admin_overlap_prevented(self):
        auth(self.client, self.admin)
        start = self.appt1.start_at + timedelta(minutes=10)
        end = start + timedelta(minutes=30)
        payload = {
            "patient": self.patient.id,
            "doctor": self.doctor1.id,
            "service": self.service.id,
            "room": self.room.id,
            "start_at": start.isoformat(),
            "end_at": end.isoformat(),
            "status": "SCHEDULED",
            "reason": "overlap",
            "comment": "",
        }
        r = self.client.post("/api/admin/appointments/", payload, format="json")
        self.assertEqual(r.status_code, 400)

    def test_doctor_cannot_create_visit_note_for(self):
        auth(self.client, self.doctor1)
        payload = {"appointment": self.appt2.id, "note_text": "test"}
        r = self.client.post("/api/doctor/visit-notes/", payload, format="json")
        self.assertEqual(r.status_code, 400)

    def test_doctor_can_create_visit_note_for_own_appointment(self):
        auth(self.client, self.doctor1)
        payload = {"appointment": self.appt1.id, "note_text": "ok"}
        r = self.client.post("/api/doctor/visit-notes/", payload, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data["appointment"], self.appt1.id)
