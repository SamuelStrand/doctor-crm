import React from "react";
import { Link } from "react-router-dom";
import "../../styles/adminDashboard.css";

function Card({ title, desc, to }) {
  return (
    <Link to={to} className="adminDashCard">
      <div className="adminDashCardTop">
        <div className="adminDashCardTitle">{title}</div>
        <div className="adminDashCardArrow">→</div>
      </div>
      <div className="adminDashCardDesc">{desc}</div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="adminDashPage">
      <div className="adminDashContainer">
        <div className="adminDashHeader">
          <div>
            <h2 className="adminDashTitle">Admin • Dashboard</h2>
            <p className="adminDashSubtitle">
              Manage clinic data: appointments, patients, doctors, services and rooms.
            </p>

            <div className="adminDashBadgeRow">
              <span className="adminDashBadge">CRUD</span>
              <span className="adminDashBadge">Search & filters</span>
              <span className="adminDashBadge">Role-based access</span>
            </div>
          </div>
        </div>

        <div className="adminDashGrid">
          <Card title="Appointments" desc="Manage all appointments, search, filters, edit & delete" to="/admin/appointments" />
          <Card title="Patients" desc="Patients list with CRUD + search" to="/admin/patients" />
          <Card title="Doctors" desc="Doctors list with CRUD + search" to="/admin/doctors" />
          <Card title="Services" desc="Clinic services list and management" to="/admin/services" />
          <Card title="Rooms" desc="Rooms management and configuration" to="/admin/rooms" />
          <Card title="Schedule" desc="View overall doctor schedules (admin view)" to="/admin/schedule" />
        </div>

        <div className="adminDashFooter">
          Tip: use the search input inside each section (Patients / Doctors / Appointments) to quickly find records.
        </div>
      </div>
    </div>
  );
}
