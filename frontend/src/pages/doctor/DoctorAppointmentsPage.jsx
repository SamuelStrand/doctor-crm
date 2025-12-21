import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";
import SearchInput from "../../components/common/SearchInput";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import "../../styles/DoctorAppointmentsPage.css";

function pad2(n) {
  return String(n).padStart(2, "0");
}
function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseYmdToDate(s) {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
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
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${ymd(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
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

function asText(v) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    return (
      v.full_name ||
      v.name ||
      v.name_ru ||
      v.name_en ||
      v.title ||
      v.code ||
      v.email ||
      v.phone ||
      v.id ||
      ""
    )
      ? String(
          v.full_name ||
            v.name ||
            v.name_ru ||
            v.name_en ||
            v.title ||
            v.code ||
            v.email ||
            v.phone ||
            v.id
        )
      : "";
  }
  return "";
}

function buildSearchHaystack(a) {
  // максимально "широкая" строка для локального поиска
  const parts = [
    a?.id,
    a?.status,
    a?.reason,
    a?.comment,
    a?.notes,
    a?.patient_name,
    a?.doctor_name,
    asText(a?.patient),
    asText(a?.doctor),
    asText(a?.service),
    asText(a?.room),
    a?.start_at,
    a?.end_at,
  ];
  return parts
    .filter(Boolean)
    .map((x) => String(x).toLowerCase())
    .join(" • ");
}

export default function DoctorAppointmentsPage() {
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  // если серверный search не работает — переключаемся на локальный
  const [serverSearchOk, setServerSearchOk] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);

    const q = debouncedSearch.trim();
    try {
      // 1) пробуем серверный поиск
      const data = await doctorApi.listAppointments({
        page,
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo ? { date_to: dateTo } : {}),
        ...(q ? { search: q } : {}),
      });

      const { items, count } = unwrapPaginated(data);
      setItems(items);
      setCount(count);

      // если у нас был search, но сервер всегда отдаёт 0 — возможно search не поддерживается.
      // тут не будем сразу выключать, но запомним "вроде ок".
      setServerSearchOk(true);
    } catch (e) {
      // если запрос с search упал — пробуем без search и включим локальный поиск
      const qHad = debouncedSearch.trim().length > 0;
      if (!qHad) {
        setErr(e?.response?.data ?? { detail: e.message });
        setItems([]);
        setCount(0);
        setServerSearchOk(true);
        setLoading(false);
        return;
      }

      try {
        const data2 = await doctorApi.listAppointments({
          page,
          ...(dateFrom ? { date_from: dateFrom } : {}),
          ...(dateTo ? { date_to: dateTo } : {}),
          // без search
        });

        const { items: items2, count: count2 } = unwrapPaginated(data2);
        setItems(items2);
        setCount(count2);
        setServerSearchOk(false); // будем искать локально
        setErr(null);
      } catch (e2) {
        setErr(e2?.response?.data ?? { detail: e2.message });
        setItems([]);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page, dateFrom, dateTo, debouncedSearch]);

  const fromD = useMemo(() => parseYmdToDate(dateFrom), [dateFrom]);
  const toD = useMemo(() => parseYmdToDate(dateTo), [dateTo]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    return items.filter((a) => {
      // статус
      if (status && a.status !== status) return false;

      // даты (локально)
      const ad = appointmentLocalDate(a);
      if (fromD && ad && ad < fromD) return false;
      if (toD && ad && ad > toD) return false;

      // поиск: если серверный не ок — применяем локальный
      if (q && !serverSearchOk) {
        const hay = buildSearchHaystack(a);
        return hay.includes(q);
      }

      // если серверный ок — не фильтруем повторно (иначе будет “двойной фильтр”)
      return true;
    });
  }, [items, status, fromD, toD, debouncedSearch, serverSearchOk]);

  const reset = () => {
    setPage(1);
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setServerSearchOk(true);
  };

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

  const nextDisabled = items.length === 0 || filtered.length === 0;

  return (
    <div className="daPage">
      <div className="daTop">
        <div className="daBreadcrumb">Doctor</div>

        <div className="daHeadRow">
          <h1 className="daTitle">Appointments</h1>
          <div className="daMeta">
            Total: <b>{count}</b>
          </div>
        </div>

        <div className="daToolbar">
          <div className="daSearch">
            <SearchInput
              value={search}
              onChange={(v) => {
                // на всякий случай нормализуем
                const value = typeof v === "string" ? v : v?.target?.value ?? "";
                setPage(1);
                setSearch(value);
              }}
              placeholder="Search (patient, doctor, etc.)"
            />
          </div>

          <label className="daChip">
            <span>Status</span>
            <select
              className="daSelect"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </label>

          <label className="daChip">
  <span>From</span>
  <input
    className="daInput"
    type="date"
    value={dateFrom}
    onChange={(e) => {
      setPage(1);
      setDateFrom(e.target.value);
    }}
  />
</label>

<label className="daChip">
  <span>To</span>
  <input
    className="daInput"
    type="date"
    value={dateTo}
    onChange={(e) => {
      setPage(1);
      setDateTo(e.target.value);
    }}
  />
</label>


          <button className="daGhost" onClick={reset} type="button">
            Reset
          </button>

          {!serverSearchOk && debouncedSearch.trim() && (
            <div className="daHintPill" title="Server search not available. Using local search on loaded page.">
              Local search
            </div>
          )}
        </div>

        {loading && <div className="daLoading">Loading…</div>}

        {err && (
          <div className="daError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      {!loading && (
        <div className="daCard">
          <div className="daCardTitle">List</div>

          <div className="daTableWrap">
            <table className="daTable">
              <thead>
                <tr>
                  <th className="daTh">ID</th>
                  <th className="daTh">Start</th>
                  <th className="daTh">End</th>
                  <th className="daTh">Status</th>
                  <th className="daTh">Patient</th>
                  <th className="daTh">Doctor</th>
                  <th className="daTh">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="daTr">
                    <td className="daTd daMono">{a.id}</td>
                    <td className="daTd">{fmtDT(a.start_at)}</td>
                    <td className="daTd">{fmtDT(a.end_at)}</td>
                    <td className="daTd">
                      <span className={`daBadge ${a.status || ""}`}>{statusLabel(a.status)}</span>
                    </td>
                    <td className="daTd daEll">
                      {a.patient_name ?? a.patient?.full_name ?? a.patient ?? "—"}
                    </td>
                    <td className="daTd daEll">
                      {a.doctor_name ?? a.doctor?.full_name ?? a.doctor ?? "—"}
                    </td>
                    <td className="daTd daActions">
                      <Link className="daLink" to={`/doctor/appointments/${a.id}`}>
                        Open
                      </Link>

                      {a.status === "SCHEDULED" && (
                        <button
                          className="daPrimarySm"
                          onClick={() => confirm(a.id)}
                          disabled={actingId === a.id}
                          type="button"
                        >
                          {actingId === a.id ? "Confirming…" : "Confirm"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td className="daTd daEmpty" colSpan="7">
                      No appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="daPager">
            <button
              className="daGhost"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              Prev
            </button>

            <span className="daPageNum">Page {page}</span>

            <button
              className="daGhost"
              disabled={nextDisabled || loading}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Next
            </button>

            <span className="daPagerMeta">
              Showing: <b>{filtered.length}</b>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
