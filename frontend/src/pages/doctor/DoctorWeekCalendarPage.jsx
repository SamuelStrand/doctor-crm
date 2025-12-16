import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymdLocal(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function timeHHMM(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function humanDayTitle(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
}

export default function DoctorWeekCalendarPage() {
  const nav = useNavigate();

  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const range = useMemo(() => {
    const from = ymdLocal(days[0]);
    const to = ymdLocal(days[6]);
    return { from, to };
  }, [days]);

  const grouped = useMemo(() => {
    const map = {};
    for (const d of days) map[ymdLocal(d)] = [];

    for (const a of items) {
      const key = ymdLocal(new Date(a.start_at));
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }

    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
    }

    return map;
  }, [items, days]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await doctorApi.listAppointments({
        date_from: range.from,
        date_to: range.to,
        page_size: 200,
      });
      const { items } = unwrapPaginated(data);
      setItems(items);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const prevWeek = () => setWeekStart((ws) => startOfWeekMonday(addDays(ws, -7)));
  const nextWeek = () => setWeekStart((ws) => startOfWeekMonday(addDays(ws, 7)));
  const todayWeek = () => setWeekStart(startOfWeekMonday(new Date()));

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Doctor • Week calendar</h2>
        <span style={{ color: "#666" }}>
          {range.from} — {range.to}
        </span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={prevWeek}>← Prev</button>
          <button onClick={todayWeek}>Today</button>
          <button onClick={nextWeek}>Next →</button>
        </div>
      </div>

      {err && (
        <pre style={{ background: "#eee", padding: 12, marginTop: 12 }}>
          {JSON.stringify(err, null, 2)}
        </pre>
      )}
      {loading && <p style={{ marginTop: 12 }}>Loading…</p>}

      {!loading && (
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 10,
          }}
        >
          {days.map((d) => {
            const key = ymdLocal(d);
            const list = grouped[key] ?? [];

            return (
              <div
                key={key}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 10,
                  minHeight: 220,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <b>{humanDayTitle(d)}</b>
                  <span style={{ color: "#999", fontSize: 12 }}>{key}</span>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {list.map((a) => (
                    <div key={a.id} style={{ display: "grid", gap: 6 }}>
                      <Link
                        to={`/doctor/appointments/${a.id}`}
                        style={{
                          display: "block",
                          textDecoration: "none",
                          color: "black",
                          border: "1px solid #eee",
                          borderRadius: 10,
                          padding: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>
                            {timeHHMM(a.start_at)}–{timeHHMM(a.end_at)}
                          </span>
                          <span style={{ fontSize: 12, color: "#666" }}>{a.status}</span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: 13 }}>
                          {a.patient?.full_name ?? a.patient?.id ?? "Patient"}
                        </div>
                      </Link>

                      <button onClick={() => nav(`/doctor/visit-notes?appointment=${a.id}`)}>
                        Note
                      </button>
                    </div>
                  ))}

                  {list.length === 0 && <div style={{ color: "#999" }}>No appointments</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
