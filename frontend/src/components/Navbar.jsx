import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/Navbar.css";

import { useTranslation } from "react-i18next"; // NEW
import LanguageSwitcher from "./common/LanguageSwitcher"; // NEW

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation(); // NEW

  const isDoctor = user?.role === "DOCTOR";
  const isAdmin = user?.role === "ADMIN";

  const navLinkClass = ({ isActive }) => `nbLink ${isActive ? "active" : ""}`;

  return (
    <header className="nbBar">
      <div className="nbInner">
        <Link to="/" className="nbBrand">
          <span className="nbBrandDot" />
          Doctor CRM
        </Link>

        <nav className="nbNav">
          <NavLink to="/" className={navLinkClass}>
            {t("nav.home")}
          </NavLink>

          {isDoctor && (
            <>
              <NavLink to="/doctor" className={navLinkClass}>
                {t("nav.doctor")}
              </NavLink>
              <NavLink to="/doctor/appointments" className={navLinkClass}>
                {t("nav.appointments")}
              </NavLink>
              <NavLink to="/doctor/calendar" className={navLinkClass}>
                {t("nav.calendar")}
              </NavLink>
              <NavLink to="/doctor/schedule" className={navLinkClass}>
                {t("nav.schedule")}
              </NavLink>
              <NavLink to="/doctor/visit-notes" className={navLinkClass}>
                {t("nav.visitNotes")}
              </NavLink>
              <NavLink to="/doctor/patients" className={navLinkClass}>
                {t("nav.patients")}
              </NavLink>
              <NavLink to="/doctor/time-off" className={navLinkClass}>
                {t("nav.timeOff")}
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin" className={navLinkClass}>
                {t("nav.admin")}
              </NavLink>
              <NavLink to="/admin/schedule" className={navLinkClass}>
                {t("nav.schedule")}
              </NavLink>
              <NavLink to="/admin/appointments" className={navLinkClass}>
                {t("nav.appointments")}
              </NavLink>
              <NavLink to="/admin/patients" className={navLinkClass}>
                {t("nav.patients")}
              </NavLink>
              <NavLink to="/admin/doctors" className={navLinkClass}>
                {t("nav.doctors")}
              </NavLink>
              <NavLink to="/admin/services" className={navLinkClass}>
                {t("nav.services")}
              </NavLink>
              <NavLink to="/admin/rooms" className={navLinkClass}>
                {t("nav.rooms")}
              </NavLink>
            </>
          )}
        </nav>

        <div className="nbRight">
          <LanguageSwitcher /> {/* NEW: переключатель */}

          {user ? (
            <>
              <div className="nbUser">
                <div className="nbUserEmail">{user.email}</div>
                <div className="nbUserRole">{user.role}</div>
              </div>

              <button className="nbBtn danger" onClick={logout}>
                {t("common.logout")}
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              {t("auth.login")}
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
