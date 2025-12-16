import React from "react";
import { Link } from "react-router-dom";

export default function AppointmentCard({ a, to }) {
  return (
    <tr>
      <td>{a.id}</td>
      <td>{a.start_at}</td>
      <td>{a.end_at}</td>
      <td>{a.status}</td>
      <td>{a.patient?.full_name ?? a.patient?.id ?? "-"}</td>
      <td>{a.doctor?.full_name ?? a.doctor?.id ?? "-"}</td>
      <td>
        <Link to={to}>Open</Link>
      </td>
    </tr>
  );
}
