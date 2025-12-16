import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function toIsoStart(yyyyMmDd) {
  if (!yyyyMmDd) return null;
  return `${yyyyMmDd}T00:00:00`;
}
function toIsoEnd(yyyyMmDd) {
  if (!yyyyMmDd) return null;
  return `${yyyyMmDd}T23:59:59`;
}

export default function AdminAppointmentsPage() {
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState(""); // YYYY-MM-DD

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const params = useMemo(() => {
    const p = { page };
    if (status) p.status = status;
    if (dateFrom) p.date_from = toIsoStart(dateFrom);
    if (dateTo) p.date_to = toIsoEnd(dateTo);
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, status, dateFrom, dateTo, debouncedSearch]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listAppointments(params);
      const { items, count } = unwrapPaginated(data);
      setItems(items);
      setCount(count);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]); // eslint-disable-line

  const resetFilters = () => {
    setPage(1);
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Admin • Appointments</h2>
        <Link to="/admin/appointments/new">+ New</Link>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 12, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search appointments (ids, reason, comment...)"
          style={{ padding: 8, minWidth: 280 }}
        />

        <label>Status:</label>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="NO_SHOW">NO_SHOW</option>
        </select>

        <label>From:</label>
        <input type="date" value={dateFrom} onChange={(e) => { setPage(1); setDateFrom(e.target.value); }} />

        <label>To:</label>
        <input type="date" value={dateTo} onChange={(e) => { setPage(1); setDateTo(e.target.value); }} />

        <button onClick={resetFilters}>Reset</button>

        <span style={{ marginLeft: "auto", color: "#666" }}>Total: {count}</span>
      </div>

      {loading && <p>Loading…</p>}
      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}

      {!loading && (
        <>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Service</th>
                <th>Room</th>
                <th>Reason</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.start_at ?? "-"}</td>
                  <td>{a.end_at ?? "-"}</td>
                  <td>{a.status ?? "-"}</td>

                  {/* В админ-схеме обычно идут integer id, но если бэк вернёт объект — тоже ок */}
                  <td>{a.patient?.full_name ?? a.patient?.id ?? a.patient ?? "-"}</td>
                  <td>{a.doctor?.doctor_profile?.full_name ?? a.doctor?.full_name ?? a.doctor?.id ?? a.doctor ?? "-"}</td>
                  <td>{a.service?.name ?? a.service?.id ?? a.service ?? "-"}</td>
                  <td>{a.room?.name ?? a.room?.id ?? a.room ?? "-"}</td>

                  <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.reason ?? "-"}
                  </td>

                  <td style={{ display: "flex", gap: 8 }}>
                    <Link to={`/admin/appointments/${a.id}`}>Open</Link>
                    <button onClick={() => remove(a.id)}>Delete</button>
                  </td>
                  <td>
                    <Link to={`/admin/appointments/${a.id}/edit`}>Edit</Link>
                    </td>

                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="10">No appointments</td></tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {page}</span>
            <button disabled={items.length === 0} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
