import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/DoctorWeekCalendarPage.css";

const ACCENT = "#8b3dff";

function pad2(n) {
  return String(n).padStart(2, "0");
}
function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function toInputDate(d) {
  return ymd(startOfDay(d));
}
function fromInputDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  return d;
}

function timeLabelFromMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}
function minutesFromISO(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
}

function pickDoctorId(a) {
  const d = a?.doctor;
  if (typeof d === "number") return d;
  if (typeof d === "string") return d;
  if (d && typeof d === "object") return d.id ?? d.user_id ?? d.user?.id ?? "unknown";
  return "unknown";
}
function pickDoctorName(a) {
  const d = a?.doctor;
  if (!d) return "Doctor";
  if (typeof d === "string" || typeof d === "number") return `Doctor ${d}`;
  return (
    d.full_name ||
    d.doctor_profile?.full_name ||
    d.user?.email ||
    (d.id != null ? `Doctor #${d.id}` : "Doctor")
  );
}
function pickDoctorPhone(a) {
  const d = a?.doctor;
  if (!d || typeof d !== "object") return "";
  return d.phone || d.doctor_profile?.phone || "";
}
function pickPatientName(a) {
  const p = a?.patient;
  if (!p) return a?.patient_name || "Patient";
  if (typeof p === "string" || typeof p === "number") return String(p);
  return p.full_name || p.name || (p.id != null ? `Patient #${p.id}` : "Patient");
}
function pickServiceName(a) {
  const s = a?.service;
  if (!s) return a?.service_name || "";
  if (typeof s === "string" || typeof s === "number") return String(s);
  return s.name || s.name_ru || s.name_en || s.code || (s.id != null ? `Service #${s.id}` : "");
}

function statusTone(status) {
  const st = (status || "").toUpperCase();
  if (st === "CONFIRMED") return "confirmed";
  if (st === "COMPLETED") return "completed";
  if (st === "CANCELLED") return "cancelled";
  if (st === "NO_SHOW") return "noshow";
  return "scheduled";
}

export default function DoctorWeekCalendarPage() {
  const { t } = useTranslation();

  const [date, setDate] = useState(() => toInputDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]);

  // пока просто UI
  const [spec, setSpec] = useState("ALL");

  const dayObj = useMemo(() => fromInputDate(date) ?? startOfDay(new Date()), [date]);

  // рабочие часы
  const DAY_START = 9 * 60; // 09:00
  const DAY_END = 18 * 60; // 18:00
  const STEP = 30; // 30 мин

  const slots = useMemo(() => {
    const arr = [];
    for (let tt = DAY_START; tt < DAY_END; tt += STEP) arr.push(tt);
    return arr;
  }, []);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // ВАЖНО: как и раньше — если бэк ждёт ISO DateTime, поменяй на:
      // date_from: `${ymd(dayObj)}T00:00:00Z`, date_to: `${ymd(addDays(dayObj,1))}T00:00:00Z`
      const from = ymd(dayObj);
      const to = ymd(addDays(dayObj, 1));

      const data = await doctorApi.listAppointments({
        date_from: from,
        date_to: to,
        page_size: 500,
      });

      const { items: got } = unwrapPaginated(data);
      setItems(got);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [date]);

  const doctors = useMemo(() => {
    const map = new Map();
    for (const a of items) {
      const id = pickDoctorId(a);
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: pickDoctorName(a),
          phone: pickDoctorPhone(a),
        });
      }
    }
    return Array.from(map.values());
  }, [items]);

  const visibleDoctors = useMemo(() => {
    if (spec === "ALL") return doctors;
    return doctors;
  }, [doctors, spec]);

  const grid = useMemo(() => {
    const g = new Map(); // `${docId}|${slot}` -> appt
    for (const a of items) {
      const docId = pickDoctorId(a);
      const startM = minutesFromISO(a.start_at);
      if (startM == null) continue;

      const slot = Math.floor(startM / STEP) * STEP;
      const key = `${docId}|${slot}`;
      if (!g.has(key)) g.set(key, a);
    }
    return g;
  }, [items]);

  const prevDay = () => setDate(toInputDate(addDays(dayObj, -1)));
  const nextDay = () => setDate(toInputDate(addDays(dayObj, 1)));
  const today = () => setDate(toInputDate(new Date()));

  const formatDay = (d) =>
    new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });

  const statusLabel = (st) =>
    t(`doctor.week.status.${String(st || "").toUpperCase()}`, { defaultValue: String(st || "—") });

  return (
    <div className="djPage" style={{ "--accent": ACCENT }}>
      <div className="djTop">
        <div className="djBreadcrumb">{t("doctor.week.breadcrumb", { defaultValue: "Журнал" })}</div>
        <h1 className="djTitle">{t("doctor.week.title", { defaultValue: "Журнал" })}</h1>

        <div className="djToolbar">
          <div className="djSelectPill">
            <span className="djPillIcon">⚕</span>
            <select value={spec} onChange={(e) => setSpec(e.target.value)}>
              <option value="ALL">
                {t("doctor.week.spec.all", { defaultValue: "Все специальности" })}
              </option>
            </select>
          </div>

          <div className="djDateControls">
            <button className="djNavBtn" onClick={prevDay} type="button" aria-label="prev">
              ‹
            </button>

            <div className="djDate">
              <span className="djDateText">{formatDay(dayObj)}</span>
            </div>

            <button className="djNavBtn" onClick={nextDay} type="button" aria-label="next">
              ›
            </button>

            <input
              className="djDateInput"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="date"
            />

            <button className="djGhostBtn" onClick={today} type="button">
              {t("doctor.week.today", { defaultValue: "Сегодня" })}
            </button>
          </div>
        </div>

        {err && (
          <div className="djError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="djBoard">
        {loading && <div className="djLoading">{t("common.loading", { defaultValue: "Loading…" })}</div>}

        {!loading && (
          <div className="djTableWrap">
            <div
              className="djGrid"
              style={{
                gridTemplateColumns: `110px repeat(${Math.max(visibleDoctors.length, 1)}, minmax(220px, 1fr))`,
              }}
            >
              {/* header row */}
              <div className="djHeadCell djTimeHead">
                {t("doctor.week.table.head", { defaultValue: "График" })}
              </div>

              {visibleDoctors.length === 0 ? (
                <div className="djHeadCell">
                  <div className="djDocName">{t("doctor.week.noData", { defaultValue: "Нет данных" })}</div>
                  <div className="djDocSub">{t("doctor.week.noAppts", { defaultValue: "На выбранный день нет записей" })}</div>
                </div>
              ) : (
                visibleDoctors.map((d) => (
                  <div key={d.id} className="djHeadCell">
                    <div className="djDoc">
                      <div className="djAvatar">{(d.name || "D")[0]?.toUpperCase()}</div>
                      <div>
                        <div className="djDocName">{d.name}</div>
                        <div className="djDocSub">{d.phone ? d.phone : t("common.emptyDash", { defaultValue: "—" })}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* time rows */}
              {slots.map((tSlot) => (
                <React.Fragment key={tSlot}>
                  <div className="djTimeCell">{timeLabelFromMinutes(tSlot)}</div>

                  {visibleDoctors.length === 0 ? (
                    <div className="djCell djEmptyCell">
                      <span className="djAvailable">{t("common.emptyDash", { defaultValue: "—" })}</span>
                    </div>
                  ) : (
                    visibleDoctors.map((doc) => {
                      const appt = grid.get(`${doc.id}|${tSlot}`);

                      if (!appt) {
                        return (
                          <div key={`${doc.id}|${tSlot}`} className="djCell djEmptyCell">
                            <span className="djAvailable">
                              {t("doctor.week.free", { defaultValue: "Доступно" })}
                            </span>
                          </div>
                        );
                      }

                      const patient = pickPatientName(appt);
                      const service = pickServiceName(appt);
                      const tone = statusTone(appt.status);

                      return (
                        <div key={`${doc.id}|${tSlot}`} className={`djCell djBusy ${tone}`}>
                          <Link to={`/doctor/appointments/${appt.id}`} className="djAppt">
                            <div className="djApptTop">
                              <div className="djApptName">{patient}</div>
                              <div className={`djStatus ${tone}`}>{statusLabel(appt.status)}</div>
                            </div>

                            <div className="djApptSub">
                              {service || appt.reason || t("common.emptyDash", { defaultValue: "—" })}
                            </div>

                            <div className="djApptTime">
                              {timeLabelFromMinutes(tSlot)} • #{appt.id}
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
