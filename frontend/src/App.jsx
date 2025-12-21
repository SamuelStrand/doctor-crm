import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/HomePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import AppLayout from "./layouts/AppLayout";
import GlobalSearchPage from "./pages/GlobalSearchPage";

import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import DoctorAppointmentDetailPage from "./pages/doctor/DoctorAppointmentDetailPage";
import DoctorWeekCalendarPage from "./pages/doctor/DoctorWeekCalendarPage";
import DoctorVisitNotesPage from "./pages/doctor/DoctorVisitNotesPage";
import DoctorVisitNoteDetailPage from "./pages/doctor/DoctorVisitNoteDetailPage";
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage";
import DoctorPatientDetailPage from "./pages/doctor/DoctorPatientDetailPage";
import DoctorSchedulePage from "./pages/doctor/DoctorSchedulePage";
import DoctorTimeOffPage from "./pages/doctor/DoctorTimeOffPage";


import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminSchedulePage from "./pages/admin/AdminSchedulePage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import AdminAppointmentDetailPage from "./pages/admin/AdminAppointmentDetailPage";
import AdminAppointmentFormPage from "./pages/admin/AdminAppointmentFormPage";
import AdminPatientsPage from "./pages/admin/AdminPatientsPage";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminRoomsPage from "./pages/admin/AdminRoomsPage";


export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                  <GlobalSearchPage />
              </RoleRoute>
              <GlobalSearchPage />
            </ProtectedRoute>
  }
/>
        <Route path="/doctor" element={<Navigate to="/doctor/appointments" replace />} />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorAppointmentsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorAppointmentDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/calendar"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorWeekCalendarPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/visit-notes"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorVisitNotesPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/visit-notes/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorVisitNoteDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorPatientsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorPatientDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorSchedulePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/time-off"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorTimeOffPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminSchedulePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminAppointmentsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/new"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminAppointmentFormPage mode="create" />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminAppointmentDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:id/edit"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminAppointmentFormPage mode="edit" />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminPatientsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminDoctorsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminServicesPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <RoleRoute role="ADMIN">
                <AdminRoomsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
