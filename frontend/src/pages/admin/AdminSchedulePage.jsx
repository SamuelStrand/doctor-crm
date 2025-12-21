import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminSchedulePage.css";

function toIsoLocal(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return d.toISOString();
}

function formatDT(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yy} ${hh}:${mi}`;
}

function statusLabel(st) {
  if (!st) return "—";
  const map = {
    SCHEDULED: "Scheduled",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    NO_SHOW: "No show",
  };
  return map[st] || st;
}

function pickDoctorName(a) {
  const d = a?.doctor;
  if (!d) return "Doctor —";
  if (typeof d === "string" || typeof d === "number") return `Doctor #${d}`;
  return (
    d?.doctor_profile?.full_name ||
    d?.full_name ||
    [d?.last_name, d?.first_name].filter(Boolean).join(" ") ||
    `Doctor #${d?.id ?? "?"}`
  );
}

function pickService(a) {
  const s = a?.service;
  if (!s) return "—";
  if (typeof s === "string" || typeof s === "number") return String(s);
  return s?.name_ru || s?.name_en || s?.name || s?.code || s?.id || "—";
}

function pickRoom(a) {
  const r = a?.room;
  if (!r) return "—";
  if (typeof r === "string" || typeof r === "number") return `#${r}`;
  return r?.name || r?.id || "—";
}

function pickPatient(a) {
  const p = a?.patient;
  if (!p) return "—";
  if (typeof p === "string" || typeof p === "number") return `#${p}`;
  return p?.full_name || [p?.last_name, p?.first_name].filter(Boolean).join(" ") || p?.id || "—";
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
  const [refsLoading, setRefsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setRefsLoading(true);
      try {
        const d = await adminApi.listDoctors({ page: 1, page_size: 200 });
        const { items } = unwrapPaginated(d);
        setDoctors(items);
      } catch (_) {
        setDoctors([]);
      } finally {
        setRefsLoading(false);
      }
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
      setCount(count ?? items.length);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFrom("");
    setTo("");
    setDoctor("");
    setItems([]);
    setCount(0);
    setErr(null);
  };

  const grouped = useMemo(() => {
    // key = doctor id (or string)
    const map = new Map();
    for (const a of items) {
      const key =
        typeof a?.doctor === "object" ? (a?.doctor?.id ?? "unknown") : (a?.doctor ?? "unknown");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    // сортировка групп по доктору
    return Array.from(map.entries()).sort((x, y) => String(x[0]).localeCompare(String(y[0])));
  }, [items]);

  return (
    <div className="scPage">
      <div className="scTop">
        <div className="scBreadcrumb">Schedule</div>

        <div className="scHeadRow">
          <h1 className="scTitle">Overall schedule</h1>
          <button className="scPrimary" type="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Show"}
          </button>
        </div>

        <div className="scSub">
          Фильтруется по записям (Appointments). {refsLoading ? "Список врачей загружается…" : ""}
        </div>

        <div className="scToolbar">
          <label className="scChip">
            <span>From</span>
            <input
              className="scDate"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label className="scChip">
            <span>To</span>
            <input
              className="scDate"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>

          <label className="scChip">
            <span>Doctor</span>
            <select className="scSelect" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              <option value="">All</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.id} {d?.doctor_profile?.full_name || d?.full_name || `Doctor`}
                </option>
              ))}
            </select>
          </label>

          <button className="scGhost" type="button" onClick={reset} disabled={loading}>
            Reset
          </button>

          <div className="scMeta">
            Total: <b>{count}</b>
          </div>
        </div>

        {err && (
          <div className="scError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      {!loading && grouped.length === 0 && (
        <div className="scEmpty">
          Нет записей в выбранном диапазоне.
        </div>
      )}

      {!loading &&
        grouped.map(([docId, list]) => (
          <div key={String(docId)} className="scCard">
            <div className="scCardHead">
              <div className="scDocTitle">
                <div className="scDocLabel">Doctor</div>
                <div className="scDocName">
                  {(() => {
                    const found = doctors.find((d) => String(d.id) === String(docId));
                    if (found) return `#${found.id} ${found?.doctor_profile?.full_name || found?.full_name || "Doctor"}`;
                    return `#${docId}`;
                  })()}
                </div>
              </div>

              <div className="scCountPill">
                {list.length} appt
              </div>
            </div>

            <div className="scTableWrap">
              <table className="scTable">
                <thead>
                  <tr>
                    <th className="scTh">ID</th>
                    <th className="scTh">Start</th>
                    <th className="scTh">End</th>
                    <th className="scTh">Status</th>
                    <th className="scTh">Patient</th>
                    <th className="scTh">Service</th>
                    <th className="scTh">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className="scTr">
                      <td className="scTd scMono">{a.id}</td>
                      <td className="scTd">{formatDT(a.start_at)}</td>
                      <td className="scTd">{formatDT(a.end_at)}</td>
                      <td className="scTd">
                        <span className={`scBadge ${a.status || ""}`}>{statusLabel(a.status)}</span>
                      </td>
                      <td className="scTd">{pickPatient(a)}</td>
                      <td className="scTd">{pickService(a)}</td>
                      <td className="scTd">{pickRoom(a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

           
          </div>
        ))}
    </div>
  );
}
