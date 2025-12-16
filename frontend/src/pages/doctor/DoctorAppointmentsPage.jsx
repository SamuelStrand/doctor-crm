import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";
import SearchInput from "../../components/common/SearchInput";
import useDebouncedValue from "../../hooks/useDebouncedValue";

function pad2(n) {
  return String(n).padStart(2, "0");
}
function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseYmdToDate(s) {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  return d;
}
function appointmentLocalDate(a) {
  const iso = a?.start_at || a?.start || a?.start_time;
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}
function fmtDT(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${ymd(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function DoctorAppointmentsPage() {
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ✅ поиск
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // ⚠️ status/date_from/date_to оставляем как есть (если бэк умеет — супер)
      // ✅ search добавляем серверно
      const data = await doctorApi.listAppointments({
        page,
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo ? { date_to: dateTo } : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      });

      const { items, count } = unwrapPaginated(data);
      setItems(items);
      setCount(count);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, dateFrom, dateTo, debouncedSearch]); // eslint-disable-line

  const fromD = useMemo(() => parseYmdToDate(dateFrom), [dateFrom]);
  const toD = useMemo(() => parseYmdToDate(dateTo), [dateTo]);

  // ✅ локальный фильтр по статусу + датам (поиск делаем сервером)
  const filtered = useMemo(() => {
    return items.filter((a) => {
      if (status && a.status !== status) return false;
      const ad = appointmentLocalDate(a);
      if (fromD && ad && ad < fromD) return false;
      if (toD && ad && ad > toD) return false;
      return true;
    });
  }, [items, status, fromD, toD]);

  const confirm = async (appointmentId) => {
    setErr(null);
    setActingId(appointmentId);
    try {
      await doctorApi.setStatus(appointmentId, "CONFIRMED");
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Doctor • Appointments</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <SearchInput
          value={search}
          onChange={(v) => { setPage(1); setSearch(v); }}
          placeholder="Search (patient, doctor, etc.)"
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
        <input value={dateFrom} onChange={(e) => { setPage(1); setDateFrom(e.target.value); }} placeholder="YYYY-MM-DD" />

        <label>To:</label>
        <input value={dateTo} onChange={(e) => { setPage(1); setDateTo(e.target.value); }} placeholder="YYYY-MM-DD" />

        <button onClick={() => { setPage(1); setSearch(""); setStatus(""); setDateFrom(""); setDateTo(""); }}>
          Reset
        </button>
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{fmtDT(a.start_at)}</td>
                  <td>{fmtDT(a.end_at)}</td>
                  <td>{a.status}</td>
                  <td>{a.patient_name ?? a.patient?.full_name ?? a.patient ?? "-"}</td>
                  <td>{a.doctor_name ?? a.doctor?.full_name ?? a.doctor ?? "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link to={`/doctor/appointments/${a.id}`}>Open</Link>
                    {a.status === "SCHEDULED" && (
                      <button
                        onClick={() => confirm(a.id)}
                        disabled={actingId === a.id}
                        style={{ marginLeft: 8 }}
                      >
                        {actingId === a.id ? "Confirming..." : "Confirm"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr><td colSpan="7">No appointments</td></tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {page}</span>
            <button disabled={items.length === 0} onClick={() => setPage((p) => p + 1)}>Next</button>
            <span style={{ marginLeft: "auto" }}>Total: {count}</span>
          </div>
        </>
      )}
    </div>
  );
}
