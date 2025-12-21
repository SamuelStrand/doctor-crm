import "../styles/home.css";

export default function Home() {
  return (
    <div className="homePage">
      <div className="homeCard">
        <h2 className="homeTitle">Doctor CRM</h2>
        <p className="homeSubtitle">
          Internal system for clinics to manage appointments, doctors, patients, services and rooms in one place.
        </p>

        <div className="homeBadgeRow">
          <span className="homeBadge">Role-based access</span>
          <span className="homeBadge">Appointments & calendar</span>
          <span className="homeBadge">Admin panel CRUD</span>
        </div>

        <div className="homeGrid">
          <div className="homeItem">
            <p className="homeItemTitle">Who can log in</p>
            <p className="homeItemText">
              Only <b>Admins</b> and <b>Doctors</b> can access the system. Patients do not log in here.
            </p>
          </div>

          <div className="homeItem">
            <p className="homeItemTitle">Admin</p>
            <p className="homeItemText">
              Manage doctors, patients, appointments, services and rooms. View schedules and audit logs.
            </p>
          </div>

          <div className="homeItem">
            <p className="homeItemTitle">Doctor</p>
            <p className="homeItemText">
              View weekly calendar and appointments, change statuses, work with patient list and visit notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
