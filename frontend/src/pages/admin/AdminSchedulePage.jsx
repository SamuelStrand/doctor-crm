import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";

function toIsoLocal(dt) {
  // input type="datetime-local" => "YYYY-MM-DDTHH:mm"
  // backend ждёт date-time; обычно норм отдавать как есть, но лучше в ISO:
  const d = new Date(dt);
  return d.toISOString();
}

export default function AdminSchedulePage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [doctor, setDoctor] = useState(""); // optional filter

  const [doctors, setDoctors] = useState([]);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // подтянуть докторов для фильтра (если у тебя есть listDoctors в adminApi)
    (async () => {
      try {
        const d = await adminApi.listDoctors({ page: 1 });
        const { items } = unwrapPaginated(d);
        setDoctors(items);
      } catch (_) {}
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = {
        page: 1,
        ...(from ? { date_from: toIsoLocal(from) } : {}),
        ...(to ? { date_to: toIsoLocal(to) } : {}),
        ...(doctor ? { doctor: Number(doctor) } : {}),
        ordering: "start_at",
      };
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

  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of items) {
      const docId = a.doctor ?? "unknown";
      if (!map.has(docId)) map.set(docId, []);
      map.get(docId).push(a);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin • Overall schedule (from Appointments)</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <label>From:</label>
        <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />

        <label>To:</label>
        <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />

        <label>Doctor:</label>
        <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
          <option value="">All</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name ?? `Doctor #${d.id}`}
            </option>
          ))}
        </select>

        <button onClick={load}>Show</button>
        <button onClick={() => { setFrom(""); setTo(""); setDoctor(""); setItems([]); setCount(0); }}>
          Reset
        </button>

        <span style={{ marginLeft: "auto" }}>Total: {count}</span>
      </div>

      {loading && <p>Loading…</p>}
      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}

      {!loading && grouped.length === 0 && <p style={{ opacity: 0.8 }}>No appointments in selected range.</p>}

      {!loading && grouped.map(([docId, list]) => (
        <div key={docId} style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 6 }}>
            Doctor: {docId}
          </h3>

          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.start_at}</td>
                  <td>{a.end_at}</td>
                  <td>{a.status}</td>
                  <td>{a.patient}</td>
                  <td>{a.service}</td>
                  <td>{a.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
