import React, { useEffect, useMemo, useState } from "react";
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

function formatMoneyKZT(x) {
  if (x == null) return "—";
  const s = String(x).replace(",", ".");
  const num = Number(s);
  if (!Number.isFinite(num)) return String(x);
  return new Intl.NumberFormat("ru-RU").format(Math.round(num)) + " ₸";
}

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [category, setCategory] = useState("all");

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // optional fields (если у тебя на бэке есть)
  const [serviceCategory, setServiceCategory] = useState("");
  const [description, setDescription] = useState("");

  const queryParams = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (category !== "all") p.category = category; // если бэк умеет — ок; если нет — проигнорит
    return p;
  }, [page, debouncedSearch, category]);

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

  // закрывать ⋮ меню по клику вне
  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest?.(".sMenuWrap")) setMenuOpenId(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    for (const s of items) {
      const c =
        (s.category_name ?? s.category ?? s.service_category ?? s.type ?? "").toString().trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const viewItems = useMemo(() => {
    let arr = [...items];

    if (category !== "all") {
      arr = arr.filter((s) => {
        const c =
          (s.category_name ?? s.category ?? s.service_category ?? s.type ?? "").toString().trim();
        return c === category;
      });
    }

    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      arr = arr.filter((s) => {
        const txt = `${s.code || ""} ${s.name_en || ""} ${s.name_ru || ""}`.toLowerCase();
        return txt.includes(q);
      });
    }

    return arr;
  }, [items, category, debouncedSearch]);

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setNameEn("");
    setNameRu("");
    setDuration("");
    setPrice("");
    setIsActive(true);
    setServiceCategory("");
    setDescription("");
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
    setDuration(s.duration_minutes ?? "");
    setPrice(s.price ?? "");
    setIsActive(Boolean(s.is_active));

    setServiceCategory(
      (s.category_name ?? s.category ?? s.service_category ?? s.type ?? "")?.toString?.() ?? ""
    );
    setDescription((s.description ?? s.desc ?? "")?.toString?.() ?? "");

    setIsModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!code.trim() || !nameEn.trim()) {
      setErr({ detail: "code and name_en are required" });
      return;
    }

    try {
      const payload = {
        code: code.trim(),
        name_en: nameEn.trim(),
        name_ru: nameRu.trim() || null,
        duration_minutes: duration === "" ? 0 : Number(duration),
        price: price === "" ? "0.00" : String(price),
        is_active: !!isActive,
        // если бэк НЕ поддерживает — просто убери эти поля
        category: serviceCategory.trim() || null,
        description: description.trim() || null,
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
    if (!confirm("Delete service?")) return;
    setErr(null);
    try {
      await adminApi.deleteService(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  const getTitle = (s) => (s.name_ru?.trim() ? s.name_ru : s.name_en) ?? "—";
  const getCategoryLabel = (s) =>
    (s.category_name ?? s.category ?? s.service_category ?? s.type ?? "—").toString();
  const getDesc = (s) => (s.description ?? s.desc ?? "").toString().trim();

  return (
    <div className="sPage">
      <div className="sTop">
        <div className="sBreadcrumb">Услуги</div>
        <h1 className="sTitle">Услуги</h1>

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
              placeholder="Поиск услуги"
            />
          </div>

          <select
            className="sSelect"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Все категории</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button className="sAddBtn" type="button" onClick={openCreate}>
            <span className="sAddPlus">+</span>
            Добавить услугу
          </button>
        </div>

        <div className="sMeta">
          <span>Всего: {count}</span>
          {loading && <span className="sLoading">Загрузка…</span>}
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
                    {active ? "Активна" : "Неактивна"}
                  </span>
                </div>

                <div className="sMenuWrap">
                  <button
                    className="sDots"
                    type="button"
                    onClick={() => setMenuOpenId((x) => (x === s.id ? null : s.id))}
                    aria-label="Меню"
                  >
                    ⋮
                  </button>

                  {menuOpenId === s.id && (
                    <div className="sMenu">
                      <button type="button" onClick={() => startEdit(s)}>
                        Редактировать
                      </button>
                      <button type="button" className="danger" onClick={() => remove(s.id)}>
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="sCategory">{getCategoryLabel(s)}</div>

              <div className="sKV">
                <div className="sRow">
                  <div className="sKey">Длительность:</div>
                  <div className="sVal">{(s.duration_minutes ?? 0) + " мин"}</div>
                </div>
                <div className="sRow">
                  <div className="sKey">Стоимость:</div>
                  <div className="sVal">{formatMoneyKZT(s.price)}</div>
                </div>
              </div>

              <div className="sDescBox">{desc ? desc : "—"}</div>
            </div>
          );
        })}

        {!loading && viewItems.length === 0 && <div className="sEmptyState">Услуг нет</div>}
      </div>

      <div className="sPager">
        <button
          className="sPagerBtn"
          disabled={page <= 1 || loading}
          onClick={() => safeSetPage(page - 1)}
        >
          ‹ Previous
        </button>

        <span className="sPagerInfo">
          {page} / {totalPages}
        </span>

        <button
          className="sPagerBtn"
          disabled={page >= totalPages || loading}
          onClick={() => safeSetPage(page + 1)}
        >
          Next ›
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="sModalOverlay" role="dialog" aria-modal="true">
          <div className="sModal">
            <div className="sModalHead">
              <div className="sModalTitle">
                {editingId ? `Редактировать услугу #${editingId}` : "Добавить услугу"}
              </div>
              <button className="sModalClose" type="button" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={submit} className="sForm">
              <div className="sFormGrid2">
                <label className="sField">
                  <span>Код *</span>
                  <input value={code} onChange={(e) => setCode(e.target.value)} />
                </label>
                <label className="sField">
                  <span>Категория</span>
                  <input value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} />
                </label>
              </div>

              <div className="sFormGrid2">
                <label className="sField">
                  <span>Название EN *</span>
                  <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
                </label>
                <label className="sField">
                  <span>Название RU</span>
                  <input value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
                </label>
              </div>

              <div className="sFormGrid3">
                <label className="sField">
                  <span>Длительность (мин)</span>
                  <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </label>
                <label className="sField">
                  <span>Стоимость</span>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="10000" />
                </label>
                <label className="sField sCheck">
                  <span>Статус</span>
                  <label className="sCheckRow">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Активна
                  </label>
                </label>
              </div>

              <label className="sField">
                <span>Описание</span>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <div className="sFormActions">
                <button className="sPrimary" type="submit">
                  {editingId ? "Сохранить" : "Создать"}
                </button>
                <button
                  className="sGhost"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
