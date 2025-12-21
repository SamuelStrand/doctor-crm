import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();

  const isDoctor = user?.role === "DOCTOR";
  const isAdmin = user?.role === "ADMIN";

  const navLinkClass = ({ isActive }) =>
    `nbLink ${isActive ? "active" : ""}`;

  return (
    <header className="nbBar">
      <div className="nbInner">
        <Link to="/" className="nbBrand">
          <span className="nbBrandDot" />
          Doctor CRM
        </Link>

        <nav className="nbNav">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          {isDoctor && (
            <>
              <NavLink to="/doctor" className={navLinkClass}>
                Doctor
              </NavLink>
              <NavLink to="/doctor/appointments" className={navLinkClass}>
                Appointments
              </NavLink>
              <NavLink to="/doctor/calendar" className={navLinkClass}>
                Calendar
              </NavLink>
              <NavLink to="/doctor/schedule" className={navLinkClass}>
                Schedule
              </NavLink>
              <NavLink to="/doctor/visit-notes" className={navLinkClass}>
                Visit notes
              </NavLink>
              <NavLink to="/doctor/patients" className={navLinkClass}>
                Patients
              </NavLink>
              <NavLink to="/doctor/time-off" className={navLinkClass}>
                Time-off
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
              <NavLink to="/admin/schedule" className={navLinkClass}>
                Schedule
              </NavLink>
              <NavLink to="/admin/appointments" className={navLinkClass}>
                Appointments
              </NavLink>
              <NavLink to="/admin/patients" className={navLinkClass}>
                Patients
              </NavLink>
              <NavLink to="/admin/doctors" className={navLinkClass}>
                Doctors
              </NavLink>
              <NavLink to="/admin/services" className={navLinkClass}>
                Services
              </NavLink>
              <NavLink to="/admin/rooms" className={navLinkClass}>
                Rooms
              </NavLink>
            </>
          )}
        </nav>

        <div className="nbRight">
          {user ? (
            <>
              <div className="nbUser">
                <div className="nbUserEmail">{user.email}</div>
                <div className="nbUserRole">{user.role}</div>
              </div>

              <button className="nbBtn danger" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
