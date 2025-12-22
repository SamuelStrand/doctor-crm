import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminAppointmentsPage.css";
import { useTranslation } from "react-i18next";

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

// ✅ теперь умеет: если patient=id → достаёт имя из справочника
function pickPatient(a, patientNameById) {
  const p = a?.patient;
  if (!p) return "—";

  // если бэк отдаёт id
  if (typeof p === "string" || typeof p === "number") {
    return patientNameById?.get(String(p)) || `#${p}`;
  }

  // если бэк отдаст объект
  return (
    p.full_name ||
    [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ") ||
    p.email ||
    p.id ||
    "—"
  );
}

function pickDoctor(a) {
  const d = a?.doctor;
  if (!d) return "—";
  if (typeof d === "string" || typeof d === "number") return String(d);
  return (
    d?.doctor_profile?.full_name ||
    d?.full_name ||
    [d?.last_name, d?.first_name].filter(Boolean).join(" ") ||
    d?.id ||
    "—"
  );
}

function pickService(a, lang) {
  const s = a?.service;
  if (!s) return "—";
  if (typeof s === "string" || typeof s === "number") return String(s);

  if (lang === "ru") return s?.name_ru || s?.name_en || s?.name_kk || s?.name || s?.code || s?.id || "—";
  if (lang === "en") return s?.name_en || s?.name_ru || s?.name_kk || s?.name || s?.code || s?.id || "—";
  if (lang === "kk") return s?.name_kk || s?.name_ru || s?.name_en || s?.name || s?.code || s?.id || "—";

  return s?.name_ru || s?.name_en || s?.name_kk || s?.name || s?.code || s?.id || "—";
}

function pickRoom(a) {
  const r = a?.room;
  if (!r) return "—";
  if (typeof r === "string" || typeof r === "number") return String(r);
  return r?.name || r?.id || "—";
}

export default function AdminAppointmentsPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "ru").slice(0, 2);

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(null);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: пациенты для отображения имени
  const [patients, setPatients] = useState([]);
  const [refsLoading, setRefsLoading] = useState(false);

  // ✅ подгружаем пациентов один раз
  useEffect(() => {
    (async () => {
      setRefsLoading(true);
      try {
        const p = await adminApi.listPatients({ page: 1, page_size: 500 });
        const { items } = unwrapPaginated(p);
        setPatients(items);
      } catch (_) {
        setPatients([]);
      } finally {
        setRefsLoading(false);
      }
    })();
  }, []);

  // ✅ мапа id → имя пациента
  const patientNameById = useMemo(() => {
    const m = new Map();
    for (const p of patients) {
      const name =
        p?.full_name ||
        [p?.last_name, p?.first_name, p?.middle_name].filter(Boolean).join(" ") ||
        p?.email ||
        `#${p?.id ?? "?"}`;
      if (p?.id != null) m.set(String(p.id), name);
    }
    return m;
  }, [patients]);

  const statusLabel = (st) => {
    if (!st) return "—";
    const map = {
      SCHEDULED: t("admin.appointments.status.scheduled"),
      CONFIRMED: t("admin.appointments.status.confirmed"),
      COMPLETED: t("admin.appointments.status.completed"),
      CANCELLED: t("admin.appointments.status.cancelled"),
      NO_SHOW: t("admin.appointments.status.noShow"),
    };
    return map[st] || st;
  };

  const params = useMemo(() => {
    const p = { page };
    if (status) p.status = status;
    if (dateFrom) p.date_from = toIsoStart(dateFrom);
    if (dateTo) p.date_to = toIsoEnd(dateTo);
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, status, dateFrom, dateTo, debouncedSearch]);

  const totalPages = useMemo(() => {
    const size = pageSize || items.length || 1;
    return Math.max(1, Math.ceil(count / size));
  }, [count, pageSize, items.length]);

  const safeSetPage = (n) => setPage(() => Math.min(Math.max(1, n), totalPages));

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listAppointments(params);
      const { items: gotItems, count: gotCount } = unwrapPaginated(data);

      setItems(gotItems);
      setCount(gotCount ?? gotItems.length);

      if (!pageSize && gotItems.length > 0) setPageSize(gotItems.length);
    } catch (e) {
      const detail = e?.response?.data?.detail;
      if (detail === "Invalid page.") {
        setErr(null);
        setPage(1);
        return;
      }
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [params]);

  const resetFilters = () => {
    setPage(1);
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  };

  const remove = async (id) => {
    if (!confirm(t("admin.appointments.confirmDelete"))) return;
    setErr(null);
    try {
      await adminApi.deleteAppointment(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div className="aPage">
      <div className="aTop">
        <div className="aBreadcrumb">{t("admin.appointments.breadcrumb")}</div>

        <div className="aHeadRow">
          <h1 className="aTitle">{t("admin.appointments.title")}</h1>
          <Link className="aAddBtn" to="/admin/appointments/new">
            <span className="aAddPlus">+</span>
            {t("admin.appointments.new")}
          </Link>
        </div>

        <div className="aToolbar">
          <div className="aSearch">
            <span className="aIcon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.5 16.5 21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              className="aSearchInput"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder={t("admin.appointments.searchPlaceholder")}
            />
          </div>

          <label className="aChip">
            <span>{t("admin.appointments.filters.status")}</span>
            <select
              className="aSelect"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">{t("admin.appointments.filters.all")}</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </label>

          <label className="aChip">
            <span>{t("admin.appointments.filters.from")}</span>
            <input
              className="aDate"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setPage(1);
                setDateFrom(e.target.value);
              }}
            />
          </label>

          <label className="aChip">
            <span>{t("admin.appointments.filters.to")}</span>
            <input
              className="aDate"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setPage(1);
                setDateTo(e.target.value);
              }}
            />
          </label>

          <button className="aGhostBtn" type="button" onClick={resetFilters}>
            {t("admin.appointments.reset")}
          </button>
        </div>

        <div className="aMeta">
          <span>
            {t("admin.appointments.total")}: {count}
          </span>
          {loading && <span className="aLoading">{t("admin.appointments.loading")}</span>}
          {refsLoading && <span className="aLoading">• {t("admin.schedule.loadingDoctors")}</span>}
        </div>

        {err && (
          <div className="aError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="aTableWrap">
        <table className="aTable">
          <thead>
            <tr>
              <th className="aTh">{t("admin.appointments.table.id")}</th>
              <th className="aTh">{t("admin.appointments.table.start")}</th>
              <th className="aTh">{t("admin.appointments.table.end")}</th>
              <th className="aTh">{t("admin.appointments.table.status")}</th>
              <th className="aTh">{t("admin.appointments.table.patient")}</th>
              <th className="aTh">{t("admin.appointments.table.doctor")}</th>
              <th className="aTh">{t("admin.appointments.table.service")}</th>
              <th className="aTh">{t("admin.appointments.table.room")}</th>
              <th className="aTh">{t("admin.appointments.table.reason")}</th>
              <th className="aTh aThRight">{t("admin.appointments.table.actions")}</th>
            </tr>
          </thead>

          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="aTr">
                <td className="aTd aMono">{a.id}</td>
                <td className="aTd">{formatDT(a.start_at)}</td>
                <td className="aTd">{formatDT(a.end_at)}</td>

                <td className="aTd">
                  <span className={`aBadge ${a.status || ""}`}>{statusLabel(a.status)}</span>
                </td>

                {/* ✅ имя пациента вместо id */}
                <td className="aTd">{pickPatient(a, patientNameById)}</td>

                <td className="aTd">{pickDoctor(a)}</td>
                <td className="aTd">{pickService(a, lang)}</td>
                <td className="aTd">{pickRoom(a)}</td>

                <td className="aTd aEllipsis" title={a.reason || ""}>
                  {a.reason ?? "—"}
                </td>

                <td className="aTd aTdRight">
                  <div className="aActions">
                    <Link className="aLinkBtn" to={`/admin/appointments/${a.id}`}>
                      {t("admin.appointments.actions.open")}
                    </Link>
                    <Link className="aLinkBtn" to={`/admin/appointments/${a.id}/edit`}>
                      {t("admin.appointments.actions.edit")}
                    </Link>
                    <button className="aDangerBtn" type="button" onClick={() => remove(a.id)}>
                      {t("admin.appointments.actions.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && items.length === 0 && (
              <tr>
                <td className="aEmpty" colSpan="10">
                  {t("admin.appointments.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="aPager">
        <button
          className="aPagerBtn"
          disabled={page <= 1 || loading}
          onClick={() => safeSetPage(page - 1)}
        >
          {t("admin.appointments.pager.prev")}
        </button>
        <span className="aPagerInfo">
          {page} / {totalPages}
        </span>
        <button
          className="aPagerBtn"
          disabled={page >= totalPages || loading}
          onClick={() => safeSetPage(page + 1)}
        >
          {t("admin.appointments.pager.next")}
        </button>
      </div>
    </div>
  );
}
