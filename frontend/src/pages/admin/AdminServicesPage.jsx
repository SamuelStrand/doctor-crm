import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminServicesPage.css";

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatMoneyKZT(x, locale = "ru-RU") {
  if (x == null) return "—";
  const s = String(x).replace(",", ".");
  const num = Number(s);
  if (!Number.isFinite(num)) return String(x);
  return new Intl.NumberFormat(locale).format(Math.round(num)) + " ₸";
}

function safeNumber(v, fallback = 0) {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizePrice(v) {
  const s = String(v ?? "").trim();
  if (!s) return "0.00";
  return s.replace(",", ".");
}

export default function AdminServicesPage() {
  const { t, i18n } = useTranslation();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // fields (backend)
  const [code, setCode] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [nameKk, setNameKk] = useState("");

  const [descEn, setDescEn] = useState("");
  const [descRu, setDescRu] = useState("");
  const [descKk, setDescKk] = useState("");

  const [duration, setDuration] = useState(""); // minutes
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const queryParams = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, debouncedSearch]);

  const totalPages = useMemo(() => {
    const size = pageSize || items.length || 1;
    return Math.max(1, Math.ceil(count / size));
  }, [count, pageSize, items.length]);

  const safeSetPage = (n) => setPage(() => Math.min(Math.max(1, n), totalPages));

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listServices(queryParams);
      const { items: gotItems, count: gotCount } = unwrapPaginated(data);

      setItems(gotItems);
      setCount(gotCount);

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
  }, [queryParams]);

  // close ⋮ menu on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest?.(".sMenuWrap")) setMenuOpenId(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const viewItems = useMemo(() => {
    let arr = [...items];

    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      arr = arr.filter((s) => {
        const txt = `${s.code || ""} ${s.name_en || ""} ${s.name_ru || ""} ${s.name_kk || ""}`.toLowerCase();
        return txt.includes(q);
      });
    }

    return arr;
  }, [items, debouncedSearch]);

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setNameEn("");
    setNameRu("");
    setNameKk("");
    setDescEn("");
    setDescRu("");
    setDescKk("");
    setDuration("");
    setPrice("");
    setIsActive(true);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setCode(s.code ?? "");
    setNameEn(s.name_en ?? "");
    setNameRu(s.name_ru ?? "");
    setNameKk(s.name_kk ?? "");

    setDescEn(s.description_en ?? s.description ?? "");
    setDescRu(s.description_ru ?? "");
    setDescKk(s.description_kk ?? "");

    setDuration(s.duration_minutes ?? "");
    setPrice(s.price ?? "");
    setIsActive(Boolean(s.is_active));

    setIsModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!code.trim() || !nameEn.trim()) {
      setErr({ detail: t("admin.services.validation.codeNameRequired") });
      return;
    }

    try {
      const payload = {
        code: code.trim(),

        name_en: nameEn.trim(),
        name_ru: nameRu.trim() || "",
        name_kk: nameKk.trim() || "",

        description_en: descEn.trim() || "",
        description_ru: descRu.trim() || "",
        description_kk: descKk.trim() || "",

        duration_minutes: safeNumber(duration, 0),
        price: normalizePrice(price),
        is_active: !!isActive,
      };

      if (!editingId) await adminApi.createService(payload);
      else await adminApi.patchService(editingId, payload);

      setIsModalOpen(false);
      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    setMenuOpenId(null);
    if (!confirm(t("admin.services.confirmDelete"))) return;
    setErr(null);
    try {
      await adminApi.deleteService(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  const getTitle = (s) => (s.name_ru?.trim() ? s.name_ru : s.name_en) ?? "—";
  const getDesc = (s) => {
    const ru = (s.description_ru ?? "").toString().trim();
    const en = (s.description_en ?? s.description ?? "").toString().trim();
    return ru || en || "";
  };

  const moneyLocale = i18n.language === "en" ? "en-US" : "ru-RU";

  return (
    <div className="sPage">
      <div className="sTop">
        <div className="sBreadcrumb">{t("admin.services.breadcrumb")}</div>
        <h1 className="sTitle">{t("admin.services.title")}</h1>

        <div className="sToolbar">
          <div className="sSearch">
            <span className="sIcon" aria-hidden="true">
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
              className="sSearchInput"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("admin.services.searchPlaceholder")}
            />
          </div>

          <button className="sAddBtn" type="button" onClick={openCreate}>
            <span className="sAddPlus">+</span>
            {t("admin.services.add")}
          </button>
        </div>

        <div className="sMeta">
          <span>
            {t("admin.services.total")}: {count}
          </span>
          {loading && <span className="sLoading">{t("common.loading")}</span>}
        </div>

        {err && (
          <div className="sError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="sGrid">
        {viewItems.map((s) => {
          const active = !!s.is_active;
          const desc = getDesc(s);

          return (
            <div className="sCard" key={s.id}>
              <div className="sCardTop">
                <div className="sTitleRow">
                  <div className="sCardTitle">{getTitle(s)}</div>
                  <span className={`sStatus ${active ? "on" : "off"}`}>
                    {active ? t("admin.services.status.active") : t("admin.services.status.inactive")}
                  </span>
                </div>

                <div className="sMenuWrap">
                  <button
                    className="sDots"
                    type="button"
                    onClick={() => setMenuOpenId((x) => (x === s.id ? null : s.id))}
                    aria-label={t("admin.services.menu")}
                  >
                    ⋮
                  </button>

                  {menuOpenId === s.id && (
                    <div className="sMenu">
                      <button type="button" onClick={() => startEdit(s)}>
                        {t("admin.services.actions.edit")}
                      </button>
                      <button type="button" className="danger" onClick={() => remove(s.id)}>
                        {t("admin.services.actions.delete")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="sKV">
                <div className="sRow">
                  <div className="sKey">{t("admin.services.kv.code")}:</div>
                  <div className="sVal">{s.code ?? "—"}</div>
                </div>
                <div className="sRow">
                  <div className="sKey">{t("admin.services.kv.duration")}:</div>
                  <div className="sVal">
                    {(s.duration_minutes ?? 0) + " " + t("admin.services.minutesShort")}
                  </div>
                </div>
                <div className="sRow">
                  <div className="sKey">{t("admin.services.kv.price")}:</div>
                  <div className="sVal">{formatMoneyKZT(s.price, moneyLocale)}</div>
                </div>
              </div>

              <div className="sDescBox">{desc ? desc : "—"}</div>
            </div>
          );
        })}

        {!loading && viewItems.length === 0 && <div className="sEmptyState">{t("admin.services.empty")}</div>}
      </div>

      <div className="sPager">
        <button className="sPagerBtn" disabled={page <= 1 || loading} onClick={() => safeSetPage(page - 1)}>
          {t("admin.services.pager.prev")}
        </button>

        <span className="sPagerInfo">
          {page} / {totalPages}
        </span>

        <button className="sPagerBtn" disabled={page >= totalPages || loading} onClick={() => safeSetPage(page + 1)}>
          {t("admin.services.pager.next")}
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="sModalOverlay" role="dialog" aria-modal="true">
          <div className="sModal">
            <div className="sModalHead">
              <div className="sModalTitle">
                {editingId
                  ? t("admin.services.modal.editTitle", { id: editingId })
                  : t("admin.services.modal.createTitle")}
              </div>
              <button
                className="sModalClose"
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={t("admin.services.modal.close")}
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="sForm">
              <div className="sFormGrid2">
                <label className="sField">
                  <span>{t("admin.services.form.code")} *</span>
                  <input value={code} onChange={(e) => setCode(e.target.value)} />
                </label>
                <label className="sField sCheck">
                  <span>{t("admin.services.form.status")}</span>
                  <label className="sCheckRow">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    {t("admin.services.form.active")}
                  </label>
                </label>
              </div>

              <div className="sFormGrid3">
                <label className="sField">
                  <span>{t("admin.services.form.nameEn")} *</span>
                  <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
                </label>
                <label className="sField">
                  <span>{t("admin.services.form.nameRu")}</span>
                  <input value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
                </label>
                <label className="sField">
                  <span>{t("admin.services.form.nameKk")}</span>
                  <input value={nameKk} onChange={(e) => setNameKk(e.target.value)} />
                </label>
              </div>

              <div className="sFormGrid2">
                <label className="sField">
                  <span>{t("admin.services.form.duration")}</span>
                  <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </label>
                <label className="sField">
                  <span>{t("admin.services.form.price")}</span>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={t("admin.services.form.pricePlaceholder")}
                  />
                </label>
              </div>

              <label className="sField">
                <span>{t("admin.services.form.descEn")}</span>
                <textarea rows={3} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
              </label>

              <label className="sField">
                <span>{t("admin.services.form.descRu")}</span>
                <textarea rows={3} value={descRu} onChange={(e) => setDescRu(e.target.value)} />
              </label>

              <label className="sField">
                <span>{t("admin.services.form.descKk")}</span>
                <textarea rows={3} value={descKk} onChange={(e) => setDescKk(e.target.value)} />
              </label>

              <div className="sFormActions">
                <button className="sPrimary" type="submit">
                  {editingId ? t("common.save") : t("admin.services.modal.createBtn")}
                </button>
                <button
                  className="sGhost"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>

            {/* keep translator warm */}
            <span style={{ display: "none" }}>{moneyLocale}</span>
          </div>
        </div>
      )}
    </div>
  );
}
