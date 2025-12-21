import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";
import { useTranslation } from "react-i18next";
import "../../styles/DoctorPatientsPage.css";

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function initialsFromName(name) {
  const s = String(name || "").trim();
  if (!s) return "??";
  const parts = s.split(/\s+/).filter(Boolean);
  const a = (parts[0]?.[0] || "").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return a + b || a || "??";
}

export default function DoctorPatientsPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // если твой бэк по умолчанию отдаёт 10 на страницу — всё идеально.
  const PAGE_SIZE = 10;

  const params = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, debouncedSearch]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await doctorApi.listPatients(params);
      const { items, count } = unwrapPaginated(data);

      // защита от "Invalid page"
      if (page > 1 && (!items || items.length === 0) && count > 0) {
        setPage(1);
        return;
      }

      setItems(items || []);
      setCount(count || 0);
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || "Error";

      if (String(detail).toLowerCase().includes("invalid page") && page > 1) {
        setPage(1);
        return;
      }

      setErr(e?.response?.data ?? { detail });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [params]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [debouncedSearch]);

  const hasNext = useMemo(() => {
    if (!count) return false;
    return page * PAGE_SIZE < count;
  }, [count, page]);

  const reset = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="dp-page">
      <div className="dp-header">
        <div className="dp-crumb">{t("doctor.patients.breadcrumb")}</div>

        <div className="dp-titleRow">
          <h1 className="dp-title">{t("doctor.patients.title")}</h1>
          <div className="dp-totalPill">
            {t("doctor.patients.total")}: {count}
          </div>
        </div>

        <div className="dp-toolbar">
          <div className="dp-searchWrap">
            <svg
              className="dp-searchIcon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                d="M10.5 3a7.5 7.5 0 105.02 13.09l3.7 3.7a1 1 0 001.42-1.42l-3.7-3.7A7.5 7.5 0 0010.5 3zm0 2a5.5 5.5 0 110 11 5.5 5.5 0 010-11z"
                fill="currentColor"
              />
            </svg>

            <input
              className="dp-searchInput"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("doctor.patients.searchPlaceholder")}
            />
          </div>

          <button className="dp-ghostBtn" onClick={reset} type="button">
            {t("doctor.patients.reset")}
          </button>
        </div>
      </div>

      {err && (
        <div className="dp-error">
          <div className="dp-errorTitle">{t("doctor.patients.errorTitle")}</div>
          <pre className="dp-errorPre">{JSON.stringify(err, null, 2)}</pre>
        </div>
      )}

      {loading && <div className="dp-loading">{t("common.loading")}</div>}

      {!loading && (
        <>
          <div className="dp-grid">
            {items.map((p) => {
              const computed = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
              const name = p.full_name ?? p.name ?? (computed || t("common.emptyDash"));
              const phone = p.phone ?? t("common.emptyDash");

              const initials = initialsFromName(name);

              return (
                <div key={p.id} className="dp-card">
                  <div className="dp-cardTop">
                    <div className="dp-avatar">{initials}</div>

                    <div className="dp-cardMain">
                      <div className="dp-nameRow">
                        <div className="dp-name" title={name}>
                          {name}
                        </div>

                        {/* если у тебя нет статуса "новый" — можешь убрать */}
                        <span className="dp-badge">{t("doctor.patients.badgeNew")}</span>
                      </div>

                      <div className="dp-sub">{phone}</div>
                    </div>

                    <div className="dp-dots" title={t("doctor.patients.actionsTitle")}>
                      ⋮
                    </div>
                  </div>

                  <div className="dp-cardBody">
                    <div className="dp-muted">{t("doctor.patients.lastAppointments")}</div>
                    <div className="dp-emptyBox">{t("doctor.patients.noAppointments")}</div>
                  </div>

                  <div className="dp-cardFooter">
                    <Link className="dp-openBtn" to={`/doctor/patients/${p.id}`}>
                      {t("doctor.patients.open")}
                    </Link>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="dp-emptyState">{t("doctor.patients.empty")}</div>
            )}
          </div>

          <div className="dp-pager">
            <button
              className="dp-pagerBtn"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              {t("doctor.patients.pager.prev")}
            </button>

            <div className="dp-pagePill">{page}</div>

            <button
              className="dp-pagerBtn"
              disabled={!hasNext || loading}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              {t("doctor.patients.pager.next")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
