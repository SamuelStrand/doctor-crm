from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.views import MeView, AdminDoctorViewSet
from clinic.views_admin import AdminPatientViewSet, AdminServiceViewSet, AdminRoomViewSet, AdminAppointmentViewSet
from clinic.views_doctor import DoctorAppointmentViewSet, DoctorVisitNoteViewSet, DoctorScheduleViewSet, DoctorTimeOffViewSet
from core.views import SearchView
from audit.views import AdminAuditLogViewSet

from clinic.views_doctor import DoctorPatientViewSet
from clinic.views_reports import AdminAppointmentsReportView
from accounts.auth_views import LogoutView


admin_router = DefaultRouter()
admin_router.register("doctors", AdminDoctorViewSet, basename="admin-doctors")
admin_router.register("patients", AdminPatientViewSet, basename="admin-patients")
admin_router.register("services", AdminServiceViewSet, basename="admin-services")
admin_router.register("rooms", AdminRoomViewSet, basename="admin-rooms")
admin_router.register("appointments", AdminAppointmentViewSet, basename="admin-appointments")

doctor_router = DefaultRouter()
doctor_router.register("appointments", DoctorAppointmentViewSet, basename="doctor-appointments")
doctor_router.register("visit-notes", DoctorVisitNoteViewSet, basename="doctor-visit-notes")
doctor_router.register("schedule", DoctorScheduleViewSet, basename="doctor-schedule")
doctor_router.register("time-off", DoctorTimeOffViewSet, basename="doctor-timeoff")

admin_router.register("audit-logs", AdminAuditLogViewSet, basename="admin-audit-logs")

doctor_router.register("patients", DoctorPatientViewSet, basename="doctor-patients")


urlpatterns = [
    # auth
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),

    # profile
    path("me/", MeView.as_view(), name="me"),

    # role-separated routers
    path("admin/", include(admin_router.urls)),
    path("doctor/", include(doctor_router.urls)),

    path("search/", SearchView.as_view(), name="search"),

    path("ai/", include("ai_assistant.urls")),

    path("admin/reports/appointments/", AdminAppointmentsReportView.as_view(), name="admin-reports-appointments"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),

]
