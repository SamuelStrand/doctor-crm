import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminPatientsPage.css";

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function getInitials(first = "", last = "") {
  const a = (first || "").trim().slice(0, 1).toUpperCase();
  const b = (last || "").trim().slice(0, 1).toUpperCase();
  const res = (a + b).trim();
  return res || "CL";
}

// если позже появится поле последней записи — подставишь сюда
function getLastVisitLabel(p) {
  // пример:
  // if (p.last_appointment_date) return p.last_appointment_date;
  return null;
}

export default function AdminPatientsPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI
  const [sort, setSort] = useState("none"); // none | name | created
  const [menuOpenId, setMenuOpenId] = useState(null);

  // pagination helper
  const [pageSize, setPageSize] = useState(null);

  // form (modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [gender, setGender] = useState("U"); // M/F/O/U
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  const queryParams = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    // если есть сортировка на бэке — раскомментируй и подстрой
    // if (sort !== "none") p.ordering = sort === "name" ? "last_name" : "-created_at";
    return p;
  }, [page, debouncedSearch, sort]);

  const totalPages = useMemo(() => {
    const size = pageSize || items.length || 1;
    return Math.max(1, Math.ceil(count / size));
  }, [count, pageSize, items.length]);

  const safeSetPage = (n) => {
    setPage(() => Math.min(Math.max(1, n), totalPages));
  };

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      const data = await adminApi.listPatients(queryParams);
      const { items: gotItems, count: gotCount } = unwrapPaginated(data);

      setItems(gotItems);
      setCount(gotCount);

      // запоминаем размер страницы (обычно постоянный)
      if (!pageSize && gotItems.length > 0) setPageSize(gotItems.length);
    } catch (e) {
      const detail = e?.response?.data?.detail;

      // если бэк говорит что такой страницы нет — молча откатываем
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

  const resetForm = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setMiddleName("");
    setBirthDate("");
    setGender("U");
    setPhone("");
    setEmail("");
    setAddress("");
    setComment("");
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setFirstName(p.first_name ?? "");
    setLastName(p.last_name ?? "");
    setMiddleName(p.middle_name ?? "");
    setBirthDate(p.birth_date ?? "");
    setGender(p.gender ?? "U");
    setPhone(p.phone ?? "");
    setEmail(p.email ?? "");
    setAddress(p.address ?? "");
    setComment(p.comment ?? "");
    setIsModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErr({ detail: "first_name and last_name are required" });
      return;
    }

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName.trim() || null,
        birth_date: birthDate || null,
        gender: gender || "U",
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        comment: comment || null,
      };

      if (!editingId) await adminApi.createPatient(payload);
      else await adminApi.patchPatient(editingId, payload);

      setIsModalOpen(false);
      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    setMenuOpenId(null);
    if (!confirm("Delete patient?")) return;

    setErr(null);
    try {
      await adminApi.deletePatient(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  // закрывать меню по клику вне
  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest?.(".menuWrap")) setMenuOpenId(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // если поиск поменялся — всегда на первую страницу
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [debouncedSearch]);

  return (
    <div className="pPage">
      <div className="pTop">
        <div className="pBreadcrumb">Клиенты</div>
        <h1 className="pTitle">Клиенты</h1>

        <div className="pToolbar">
          <div className="pSearch">
            <span className="pIcon" aria-hidden="true">
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
              className="pSearchInput"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск клиента"
            />
          </div>

          <select className="pSelect" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="none">Без сортировки</option>
            <option value="name">По имени</option>
            <option value="created">Сначала новые</option>
          </select>

          <button className="pAddBtn" type="button" onClick={openCreate}>
            <span className="pAddPlus">+</span>
            Добавить клиента
          </button>
        </div>

        <div className="pMeta">
          <span>Всего: {count}</span>
          {loading && <span className="pLoading">Загрузка…</span>}
        </div>

        {err && (
          <div className="pError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="pGrid">
        {items.map((p) => {
          const initials = getInitials(p.first_name, p.last_name);
          const fullName =
            `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim() || `#${p.id}`;
          const lastVisit = getLastVisitLabel(p);

          return (
            <div className="pCard" key={p.id}>
              <div className="pCardTop">
                <div className="pAvatar">{initials}</div>

                <div className="pCardMain">
                  <div className="pNameRow">
                    <div className="pName">{fullName}</div>
                    <span className="pBadge">Новый</span>
                  </div>
                  <div className="pPhone">{p.phone ? p.phone : "—"}</div>
                </div>

                <div className="menuWrap">
                  <button
                    className="pDots"
                    type="button"
                    onClick={() => setMenuOpenId((x) => (x === p.id ? null : p.id))}
                    aria-label="Меню"
                  >
                    ⋮
                  </button>

                  {menuOpenId === p.id && (
                    <div className="pMenu">
                      <button type="button" onClick={() => startEdit(p)}>
                        Редактировать
                      </button>
                      <button type="button" className="danger" onClick={() => remove(p.id)}>
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pCardBottom">
                <div className="pSubTitle">Последние записи</div>

                {lastVisit ? (
                  <div className="pDatePill">{lastVisit}</div>
                ) : (
                  <div className="pEmptyBar">Записей нет</div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && items.length === 0 && (
          <div className="pEmptyState">Клиентов нет</div>
        )}
      </div>

      <div className="pPager">
        <button
          className="pPagerBtn"
          disabled={page <= 1 || loading}
          onClick={() => safeSetPage(page - 1)}
        >
          ‹ Previous
        </button>

        <span className="pPagerInfo">
          {page} / {totalPages}
        </span>

        <button
          className="pPagerBtn"
          disabled={page >= totalPages || loading}
          onClick={() => safeSetPage(page + 1)}
        >
          Next ›
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="pModalOverlay" role="dialog" aria-modal="true">
          <div className="pModal">
            <div className="pModalHead">
              <div className="pModalTitle">
                {editingId ? `Редактировать клиента #${editingId}` : "Добавить клиента"}
              </div>
              <button
                className="pModalClose"
                onClick={() => setIsModalOpen(false)}
                aria-label="Закрыть"
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="pForm">
              <div className="pFormGrid3">
                <label className="pField">
                  <span>Имя *</span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </label>
                <label className="pField">
                  <span>Фамилия *</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </label>
                <label className="pField">
                  <span>Отчество</span>
                  <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                </label>
              </div>

              <div className="pFormGrid3">
                <label className="pField">
                  <span>Дата рождения</span>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </label>
                <label className="pField">
                  <span>Пол</span>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="U">U (Unknown)</option>
                    <option value="M">M (Male)</option>
                    <option value="F">F (Female)</option>
                    <option value="O">O (Other)</option>
                  </select>
                </label>
                <label className="pField">
                  <span>Телефон</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ..." />
                </label>
              </div>

              <div className="pFormGrid2">
                <label className="pField">
                  <span>Email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="pField">
                  <span>Адрес</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} />
                </label>
              </div>

              <label className="pField">
                <span>Комментарий</span>
                <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
              </label>

              <div className="pFormActions">
                <button className="pPrimary" type="submit">
                  {editingId ? "Сохранить" : "Создать"}
                </button>
                <button
                  className="pGhost"
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
