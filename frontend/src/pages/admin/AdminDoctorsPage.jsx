import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminDoctorsPage.css";

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function getInitials(fullName, firstName, lastName, email) {
  const src =
    (fullName && fullName.trim()) ||
    `${lastName || ""} ${firstName || ""}`.trim() ||
    (email || "").trim();

  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return "SP";
}

// просто чтобы UI был как на картинке (если реального расписания нет)
const FALLBACK_TIMES = ["10:11", "11:11", "12:11", "13:11", "14:11", "15:11", "16:11"];

export default function AdminDoctorsPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI filters
  const [profession, setProfession] = useState("all"); // specialization
  const [status, setStatus] = useState("all"); // all | online | offline
  const [sort, setSort] = useState("none"); // none | name | new

  const [menuOpenId, setMenuOpenId] = useState(null);

  // pagination helper
  const [pageSize, setPageSize] = useState(null);

  // modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // create: required, edit: optional
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");

  // ---- query params (если бэк поддерживает — будет работать; если нет — просто проигнорит)
  const queryParams = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (profession !== "all") p.specialization = profession; // optional
    if (status !== "all") p.is_active = status === "online"; // optional
    if (sort === "name") p.ordering = "last_name"; // optional
    if (sort === "new") p.ordering = "-id"; // optional
    return p;
  }, [page, debouncedSearch, profession, status, sort]);

  const totalPages = useMemo(() => {
    const size = pageSize || items.length || 1;
    return Math.max(1, Math.ceil(count / size));
  }, [count, pageSize, items.length]);

  const safeSetPage = (n) => setPage(() => Math.min(Math.max(1, n), totalPages));

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listDoctors(queryParams);
      const { items: gotItems, count: gotCount } = unwrapPaginated(data);

      setItems(gotItems);
      setCount(gotCount);

      if (!pageSize && gotItems.length > 0) setPageSize(gotItems.length);
    } catch (e) {
      const detail = e?.response?.data?.detail;

      // если бэк ругается на страницу — не показываем красную ошибку, откатываем
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
      if (!e.target.closest?.(".dMenuWrap")) setMenuOpenId(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // ---- derived lists
  const professions = useMemo(() => {
    const set = new Set();
    for (const d of items) {
      const sp = d?.doctor_profile?.specialization?.trim();
      if (sp) set.add(sp);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  // ---- filtered/sorted view (клиентская фильтрация, даже если бэк не поддерживает params)
  const viewItems = useMemo(() => {
    let arr = [...items];

    if (profession !== "all") {
      arr = arr.filter((d) => (d?.doctor_profile?.specialization || "").trim() === profession);
    }
    if (status !== "all") {
      const want = status === "online";
      arr = arr.filter((d) => !!(d?.is_active ?? true) === want);
    }

    if (sort === "name") {
      arr.sort((a, b) => {
        const an = `${a?.doctor_profile?.full_name || a?.last_name || ""} ${a?.first_name || ""}`.trim();
        const bn = `${b?.doctor_profile?.full_name || b?.last_name || ""} ${b?.first_name || ""}`.trim();
        return an.localeCompare(bn);
      });
    } else if (sort === "new") {
      arr.sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
    }

    return arr;
  }, [items, profession, status, sort]);

  // ---- modal helpers
  const resetForm = () => {
    setEditingId(null);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setIsActive(true);
    setFullName("");
    setSpecialization("");
    setDoctorPhone("");
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEmail(d.email ?? "");
    setPassword(""); // не показываем текущий пароль
    setFirstName(d.first_name ?? "");
    setLastName(d.last_name ?? "");
    setIsActive(d.is_active ?? true);
    setFullName(d.doctor_profile?.full_name ?? "");
    setSpecialization(d.doctor_profile?.specialization ?? "");
    setDoctorPhone(d.doctor_profile?.phone ?? "");
    setIsModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!email.trim()) {
      setErr({ detail: "email is required" });
      return;
    }
    if (!editingId && !password) {
      setErr({ detail: "password is required for new doctor" });
      return;
    }

    try {
      const payload = {
        email: email.trim(),
        first_name: firstName.trim() || "",
        last_name: lastName.trim() || "",
        is_active: !!isActive,
        doctor_profile: {
          full_name: fullName.trim() || "",
          specialization: specialization.trim() || "",
          phone: doctorPhone.trim() || "",
        },
      };

      if (!editingId) {
        payload.password = password;
        await adminApi.createDoctor(payload);
      } else {
        if (password) payload.password = password;
        await adminApi.patchDoctor(editingId, payload);
      }

      setIsModalOpen(false);
      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    setMenuOpenId(null);
    if (!confirm("Delete doctor?")) return;

    setErr(null);
    try {
      await adminApi.deleteDoctor(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  const getCardName = (d) => {
    const fp = d?.doctor_profile?.full_name?.trim();
    if (fp) return fp;
    const ln = d?.last_name || "";
    const fn = d?.first_name || "";
    const s = `${ln} ${fn}`.trim();
    return s || d?.email || `#${d?.id}`;
  };

  const getPhone = (d) => d?.doctor_profile?.phone || "—";
  const getSpec = (d) => d?.doctor_profile?.specialization || "—";
  const getOnline = (d) => !!(d?.is_active ?? true);

  // для красоты карточек: берём разные тайм-слоты (пока реальных нет)
  const getTimes = (d) => {
    // если у тебя когда-нибудь появится массив времен — подставишь сюда:
    // if (Array.isArray(d.doctor_profile?.slots)) return d.doctor_profile.slots;
    const seed = (d?.id ?? 1) % 3; // 0..2
    const start = seed;
    return FALLBACK_TIMES.slice(start, start + 6);
  };

  return (
    <div className="dPage">
      <div className="dTop">
        <div className="dBreadcrumb">Специалисты</div>
        <h1 className="dTitle">Специалисты</h1>

        <div className="dToolbar">
          <div className="dSearch">
            <span className="dIcon" aria-hidden="true">
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
              className="dSearchInput"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Поиск специалиста"
            />
          </div>

          <select
            className="dSelect"
            value={profession}
            onChange={(e) => {
              setProfession(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Все профессии</option>
            {professions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            className="dSelect"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Все</option>
            <option value="online">Онлайн</option>
            <option value="offline">Недоступен</option>
          </select>

          <select
            className="dSelect"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="none">Без сортировки</option>
            <option value="name">По имени</option>
            <option value="new">Сначала новые</option>
          </select>

          <button className="dAddBtn" type="button" onClick={openCreate}>
            <span className="dAddPlus">+</span>
            Добавить специалиста
          </button>
        </div>

        <div className="dMeta">
          <span>Всего: {count}</span>
          {loading && <span className="dLoading">Загрузка…</span>}
        </div>

        {err && (
          <div className="dError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="dGrid">
        {viewItems.map((d) => {
          const name = getCardName(d);
          const online = getOnline(d);
          const initials = getInitials(name, d?.first_name, d?.last_name, d?.email);

          return (
            <div className="dCard" key={d.id}>
              <div className="dCardTop">
                <div className="dAvatar">{initials}</div>

                <div className="dMain">
                  <div className="dNameRow">
                    <div className="dName">{name}</div>
                    {online ? (
                      <span className="dStatus online">Онлайн</span>
                    ) : (
                      <span className="dStatus offline">Недоступен</span>
                    )}
                  </div>

                  <div className="dPhone">{getPhone(d)}</div>
                </div>

                <div className="dMenuWrap">
                  <button
                    className="dDots"
                    type="button"
                    onClick={() => setMenuOpenId((x) => (x === d.id ? null : d.id))}
                    aria-label="Меню"
                  >
                    ⋮
                  </button>

                  {menuOpenId === d.id && (
                    <div className="dMenu">
                      <button type="button" onClick={() => startEdit(d)}>
                        Редактировать
                      </button>
                      <button type="button" className="danger" onClick={() => remove(d.id)}>
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="dSpec">{getSpec(d)}</div>

              <div className="dSchedule">
                <div className="dScheduleLabel">
                  График работы <span className="dScheduleHint">—</span>
                </div>

                <div className="dSlots">
                  {getTimes(d).map((t) => (
                    <span key={t} className="dSlot">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {!loading && viewItems.length === 0 && (
          <div className="dEmptyState">Специалистов нет</div>
        )}
      </div>

      <div className="dPager">
        <button
          className="dPagerBtn"
          disabled={page <= 1 || loading}
          onClick={() => safeSetPage(page - 1)}
        >
          ‹ Previous
        </button>

        <span className="dPagerInfo">
          {page} / {totalPages}
        </span>

        <button
          className="dPagerBtn"
          disabled={page >= totalPages || loading}
          onClick={() => safeSetPage(page + 1)}
        >
          Next ›
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="dModalOverlay" role="dialog" aria-modal="true">
          <div className="dModal">
            <div className="dModalHead">
              <div className="dModalTitle">
                {editingId ? `Редактировать специалиста #${editingId}` : "Добавить специалиста"}
              </div>
              <button
                className="dModalClose"
                onClick={() => setIsModalOpen(false)}
                aria-label="Закрыть"
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="dForm">
              <div className="dFormGrid2">
                <label className="dField">
                  <span>Email *</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label className="dField">
                  <span>{editingId ? "Новый пароль (опц.)" : "Пароль *"}</span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder={editingId ? "Оставь пустым, чтобы не менять" : "Введите пароль"}
                  />
                </label>
              </div>

              <div className="dFormGrid3">
                <label className="dField">
                  <span>Имя</span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </label>
                <label className="dField">
                  <span>Фамилия</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </label>
                <label className="dField dCheck">
                  <span>Статус</span>
                  <label className="dCheckRow">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Активен (Онлайн)
                  </label>
                </label>
              </div>

              <div className="dFormGrid3">
                <label className="dField">
                  <span>ФИО (для карточки)</span>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </label>
                <label className="dField">
                  <span>Профессия / специализация</span>
                  <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                </label>
                <label className="dField">
                  <span>Телефон</span>
                  <input value={doctorPhone} onChange={(e) => setDoctorPhone(e.target.value)} />
                </label>
              </div>

              <div className="dFormActions">
                <button className="dPrimary" type="submit">
                  {editingId ? "Сохранить" : "Создать"}
                </button>
                <button
                  className="dGhost"
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
