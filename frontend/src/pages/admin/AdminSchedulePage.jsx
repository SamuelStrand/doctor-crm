import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminSchedulePage.css";
import { useTranslation } from "react-i18next";

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

function pickDoctorName(a, t) {
  const d = a?.doctor;
  if (!d) return t("admin.schedule.doctor.unknown");
  if (typeof d === "string" || typeof d === "number") return `${t("admin.schedule.doctor.label")} #${d}`;
  return (
    d?.doctor_profile?.full_name ||
    d?.full_name ||
    [d?.last_name, d?.first_name].filter(Boolean).join(" ") ||
    `${t("admin.schedule.doctor.label")} #${d?.id ?? "?"}`
  );
}

function pickService(a, lang) {
  const s = a?.service;
  if (!s) return "—";
  if (typeof s === "string" || typeof s === "number") return String(s);

  // если бэк отдаёт name_ru/name_en/name_kk
  if (lang === "ru") return s?.name_ru || s?.name_en || s?.name_kk || s?.name || s?.code || s?.id || "—";
  if (lang === "en") return s?.name_en || s?.name_ru || s?.name_kk || s?.name || s?.code || s?.id || "—";
  if (lang === "kk") return s?.name_kk || s?.name_ru || s?.name_en || s?.name || s?.code || s?.id || "—";

  return s?.name_ru || s?.name_en || s?.name_kk || s?.name || s?.code || s?.id || "—";
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
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "ru").slice(0, 2);

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

  const statusLabel = (st) => {
    if (!st) return "—";
    const map = {
      SCHEDULED: t("admin.schedule.status.scheduled"),
      CONFIRMED: t("admin.schedule.status.confirmed"),
      COMPLETED: t("admin.schedule.status.completed"),
      CANCELLED: t("admin.schedule.status.cancelled"),
      NO_SHOW: t("admin.schedule.status.noShow"),
    };
    return map[st] || st;
  };

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
    const map = new Map();
    for (const a of items) {
      const key = typeof a?.doctor === "object" ? (a?.doctor?.id ?? "unknown") : (a?.doctor ?? "unknown");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return Array.from(map.entries()).sort((x, y) => String(x[0]).localeCompare(String(y[0])));
  }, [items]);

  return (
    <div className="scPage">
      <div className="scTop">
        <div className="scBreadcrumb">{t("admin.schedule.breadcrumb")}</div>

        <div className="scHeadRow">
          <h1 className="scTitle">{t("admin.schedule.title")}</h1>
          <button className="scPrimary" type="button" onClick={load} disabled={loading}>
            {loading ? t("admin.schedule.loading") : t("admin.schedule.show")}
          </button>
        </div>

        <div className="scSub">
          {t("admin.schedule.sub")}
          {refsLoading ? ` ${t("admin.schedule.loadingDoctors")}` : ""}
        </div>

        <div className="scToolbar">
          <label className="scChip">
            <span>{t("admin.schedule.from")}</span>
            <input
              className="scDate"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label className="scChip">
            <span>{t("admin.schedule.to")}</span>
            <input
              className="scDate"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>

          <label className="scChip">
            <span>{t("admin.schedule.doctor.label")}</span>
            <select className="scSelect" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              <option value="">{t("admin.schedule.doctor.all")}</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.id} {d?.doctor_profile?.full_name || d?.full_name || t("admin.schedule.doctor.fallback")}
                </option>
              ))}
            </select>
          </label>

          <button className="scGhost" type="button" onClick={reset} disabled={loading}>
            {t("admin.schedule.reset")}
          </button>

          <div className="scMeta">
            {t("admin.schedule.total")}: <b>{count}</b>
          </div>
        </div>

        {err && (
          <div className="scError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      {!loading && grouped.length === 0 && (
        <div className="scEmpty">{t("admin.schedule.empty")}</div>
      )}

      {!loading &&
        grouped.map(([docId, list]) => (
          <div key={String(docId)} className="scCard">
            <div className="scCardHead">
              <div className="scDocTitle">
                <div className="scDocLabel">{t("admin.schedule.doctor.label")}</div>
                <div className="scDocName">
                  {(() => {
                    const found = doctors.find((d) => String(d.id) === String(docId));
                    if (found)
                      return `#${found.id} ${found?.doctor_profile?.full_name || found?.full_name || t("admin.schedule.doctor.fallback")}`;
                    return `#${docId}`;
                  })()}
                </div>
              </div>

              <div className="scCountPill">
                {list.length} {t("admin.schedule.apptShort")}
              </div>
            </div>

            <div className="scTableWrap">
              <table className="scTable">
                <thead>
                  <tr>
                    <th className="scTh">{t("admin.schedule.table.id")}</th>
                    <th className="scTh">{t("admin.schedule.table.start")}</th>
                    <th className="scTh">{t("admin.schedule.table.end")}</th>
                    <th className="scTh">{t("admin.schedule.table.status")}</th>
                    <th className="scTh">{t("admin.schedule.table.patient")}</th>
                    <th className="scTh">{t("admin.schedule.table.service")}</th>
                    <th className="scTh">{t("admin.schedule.table.room")}</th>
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
                      <td className="scTd">{pickService(a, lang)}</td>
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
