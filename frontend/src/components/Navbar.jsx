import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const linkStyle = ({ isActive }) => ({
  padding: "8px 10px",
  borderRadius: 10,
  textDecoration: "none",
  color: "black",
  background: isActive ? "#eee" : "transparent",
});

export default function Navbar() {
  const { user, logout } = useAuth();

  const isDoctor = user?.role === "DOCTOR";
  const isAdmin = user?.role === "ADMIN";

  return (
    <div
      style={{
        borderBottom: "1px solid #eee",
        padding: "10px 16px",
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Link
        to="/"
        style={{ fontWeight: 800, textDecoration: "none", color: "black" }}
      >
        Doctor CRM
      </Link>

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <NavLink to="/" style={linkStyle}>
          Home
        </NavLink>

        {isDoctor && (
          <>
            <NavLink to="/doctor" style={linkStyle}>
              Doctor
            </NavLink>
            <NavLink to="/doctor/appointments" style={linkStyle}>
              Appointments
            </NavLink>
            <NavLink to="/doctor/calendar" style={linkStyle}>
              Calendar
            </NavLink>
            <NavLink to="/doctor/schedule" style={linkStyle}>
              Schedule
            </NavLink>
            <NavLink to="/doctor/visit-notes" style={linkStyle}>
              Visit notes
            </NavLink>
            <NavLink to="/doctor/patients" style={linkStyle}>
              Patients
            </NavLink>
            <NavLink to="/doctor/time-off" style={linkStyle}>
              Time-off
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin" style={linkStyle}>
              Admin
            </NavLink>
            <NavLink to="/admin/schedule" style={linkStyle}>
              Schedule
            </NavLink>
            <NavLink to="/admin/appointments" style={linkStyle}>
              Appointments
            </NavLink>
            <NavLink to="/admin/patients" style={linkStyle}>
              Patients
            </NavLink>
            <NavLink to="/admin/doctors" style={linkStyle}>
              Doctors
            </NavLink>
            <NavLink to="/admin/services" style={linkStyle}>
              Services
            </NavLink>
            <NavLink to="/admin/rooms" style={linkStyle}>
              Rooms
            </NavLink>
          </>
        )}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, color: "#666" }}>
              {user.email} • {user.role}
            </span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <NavLink to="/login" style={linkStyle}>
            Login
          </NavLink>
        )}
      </div>
    </div>
  );
}
