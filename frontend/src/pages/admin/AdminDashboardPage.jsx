import React from "react";
import { Link } from "react-router-dom";

function Card({ title, desc, to }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 12,
        textDecoration: "none",
        color: "black",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>{desc}</div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin • Dashboard</h2>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <Card title="Appointments" desc="Manage all appointments" to="/admin/appointments" />
        <Card title="Patients" desc="CRUD patients + search" to="/admin/patients" />
        <Card title="Doctors" desc="CRUD doctors + search" to="/admin/doctors" />
        <Card title="Services" desc="Clinic services list" to="/admin/services" />
        <Card title="Rooms" desc="Rooms management" to="/admin/rooms" />
      </div>

      <div style={{ marginTop: 18, color: "#666", fontSize: 13 }}>
        Tip: use the search box inside each section (Patients / Doctors / Appointments).
      </div>
    </div>
  );
}
