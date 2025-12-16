import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import { Link } from "react-router-dom";

export default function AdminAppointmentsListPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listAppointments({
        page,
        ...(status ? { status } : {}),
      });
      const { items } = unwrapPaginated(data);
      setItems(items);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]); // eslint-disable-line

  const remove = async (id) => {
    if (!confirm("Delete appointment?")) return;
    setErr(null);
    try {
      await adminApi.deleteAppointment(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin • Appointments</h2>
        <Link to="/admin/appointments/new">+ New</Link>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <label>Status:</label>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="NO_SHOW">NO_SHOW</option>
        </select>
      </div>

      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}
      {loading && <p>Loading…</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th><th>Start</th><th>End</th><th>Status</th><th>Patient</th><th>Doctor</th><th>Service</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.start_at}</td>
              <td>{a.end_at}</td>
              <td>{a.status}</td>
              <td>{a.patient}</td>
              <td>{a.doctor}</td>
              <td>{a.service}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <Link to={`/admin/appointments/${a.id}`}>Edit</Link>
                <button onClick={() => remove(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan="8">No appointments</td></tr>}
        </tbody>
      </table>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
