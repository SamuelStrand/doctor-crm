import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminPatientsPage.css";
import { useTranslation } from "react-i18next";

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

function getLastVisitLabel(p) {
  return null;
}

export default function AdminPatientsPage() {
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const [sort, setSort] = useState("none");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [pageSize, setPageSize] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("U");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  const queryParams = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, debouncedSearch]);

  const totalPages = useMemo(() => {
    const size = pageSize || items.length || 1;
    return Math.max(1, Math.ceil((count || 0) / size));
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
      setErr({ detail: t("admin.patients.errors.firstLastRequired") });
      return;
    }

    try {
      // blank=True, null=False -> отправляем "" (НЕ null)
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName.trim() || "",
        birth_date: birthDate || null,
        gender: gender || "U",
        phone: phone.trim() || "",
        email: email.trim() || "",
        address: address.trim() || "",
        comment: comment.trim() || "",
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
    if (!confirm(t("admin.patients.confirmDelete"))) return;

    setErr(null);
    try {
      await adminApi.deletePatient(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest?.(".menuWrap")) setMenuOpenId(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [debouncedSearch]);

  const sortedItems = useMemo(() => {
    const arr = [...items];
    if (sort === "name") {
      arr.sort((a, b) => {
        const an = `${a?.last_name || ""} ${a?.first_name || ""}`.trim().toLowerCase();
        const bn = `${b?.last_name || ""} ${b?.first_name || ""}`.trim().toLowerCase();
        return an.localeCompare(bn);
      });
    } else if (sort === "created") {
      // если created_at нет — просто по id (новые больше)
      arr.sort((a, b) => {
        const ac = a?.created_at ? new Date(a.created_at).getTime() : Number(a?.id || 0);
        const bc = b?.created_at ? new Date(b.created_at).getTime() : Number(b?.id || 0);
        return bc - ac;
      });
    }
    return arr;
  }, [items, sort]);

  const genderLabel = (g) => {
    const map = {
      U: t("admin.patients.gender.u"),
      M: t("admin.patients.gender.m"),
      F: t("admin.patients.gender.f"),
      O: t("admin.patients.gender.o"),
    };
    return map[g] || g;
  };

  return (
    <div className="pPage">
      <div className="pTop">
        <div className="pBreadcrumb">{t("admin.patients.breadcrumb")}</div>
        <h1 className="pTitle">{t("admin.patients.title")}</h1>

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
              placeholder={t("admin.patients.searchPlaceholder")}
            />
          </div>

          <select className="pSelect" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="none">{t("admin.patients.sort.none")}</option>
            <option value="name">{t("admin.patients.sort.name")}</option>
            <option value="created">{t("admin.patients.sort.created")}</option>
          </select>

          <button className="pAddBtn" type="button" onClick={openCreate}>
            <span className="pAddPlus">+</span>
            {t("admin.patients.add")}
          </button>
        </div>

        <div className="pMeta">
          <span>
            {t("admin.patients.total")}: {count}
          </span>
          {loading && <span className="pLoading">{t("common.loading")}</span>}
        </div>

        {err && (
          <div className="pError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="pGrid">
        {sortedItems.map((p) => {
          const initials = getInitials(p.first_name, p.last_name);
          const fullName = `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim() || `#${p.id}`;
          const lastVisit = getLastVisitLabel(p);

          return (
            <div className="pCard" key={p.id}>
              <div className="pCardTop">
                <div className="pAvatar">{initials}</div>

                <div className="pCardMain">
                  <div className="pNameRow">
                    <div className="pName">{fullName}</div>
                    <span className="pBadge">{t("admin.patients.badgeNew")}</span>
                  </div>
                  <div className="pPhone">{p.phone ? p.phone : "—"}</div>
                </div>

                <div className="menuWrap">
                  <button
                    className="pDots"
                    type="button"
                    onClick={() => setMenuOpenId((x) => (x === p.id ? null : p.id))}
                    aria-label={t("admin.patients.menu")}
                  >
                    ⋮
                  </button>

                  {menuOpenId === p.id && (
                    <div className="pMenu">
                      <button type="button" onClick={() => startEdit(p)}>
                        {t("admin.patients.actions.edit")}
                      </button>
                      <button type="button" className="danger" onClick={() => remove(p.id)}>
                        {t("admin.patients.actions.delete")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pCardBottom">
                <div className="pSubTitle">{t("admin.patients.lastAppointments")}</div>

                {lastVisit ? (
                  <div className="pDatePill">{lastVisit}</div>
                ) : (
                  <div className="pEmptyBar">{t("admin.patients.noAppointments")}</div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && sortedItems.length === 0 && (
          <div className="pEmptyState">{t("admin.patients.empty")}</div>
        )}
      </div>

      <div className="pPager">
        <button className="pPagerBtn" disabled={page <= 1 || loading} onClick={() => safeSetPage(page - 1)}>
          {t("admin.patients.pager.prev")}
        </button>

        <span className="pPagerInfo">
          {page} / {totalPages}
        </span>

        <button className="pPagerBtn" disabled={page >= totalPages || loading} onClick={() => safeSetPage(page + 1)}>
          {t("admin.patients.pager.next")}
        </button>
      </div>

      {isModalOpen && (
        <div className="pModalOverlay" role="dialog" aria-modal="true">
          <div className="pModal">
            <div className="pModalHead">
              <div className="pModalTitle">
                {editingId
                  ? t("admin.patients.modal.editTitle", { id: editingId })
                  : t("admin.patients.modal.createTitle")}
              </div>

              <button
                className="pModalClose"
                onClick={() => setIsModalOpen(false)}
                aria-label={t("admin.patients.modal.close")}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="pForm">
              <div className="pFormGrid3">
                <label className="pField">
                  <span>{t("admin.patients.form.firstName")} *</span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </label>

                <label className="pField">
                  <span>{t("admin.patients.form.lastName")} *</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </label>

                <label className="pField">
                  <span>{t("admin.patients.form.middleName")}</span>
                  <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                </label>
              </div>

              <div className="pFormGrid3">
                <label className="pField">
                  <span>{t("admin.patients.form.birthDate")}</span>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </label>

                <label className="pField">
                  <span>{t("admin.patients.form.gender")}</span>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="U">{genderLabel("U")}</option>
                    <option value="M">{genderLabel("M")}</option>
                    <option value="F">{genderLabel("F")}</option>
                    <option value="O">{genderLabel("O")}</option>
                  </select>
                </label>

                <label className="pField">
                  <span>{t("admin.patients.form.phone")}</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("admin.patients.form.phonePlaceholder")}
                  />
                </label>
              </div>

              <div className="pFormGrid2">
                <label className="pField">
                  <span>{t("admin.patients.form.email")}</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label className="pField">
                  <span>{t("admin.patients.form.address")}</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} />
                </label>
              </div>

              <label className="pField">
                <span>{t("admin.patients.form.comment")}</span>
                <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
              </label>

              <div className="pFormActions">
                <button className="pPrimary" type="submit">
                  {editingId ? t("common.save") : t("admin.patients.modal.createBtn")}
                </button>

                <button
                  className="pGhost"
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
          </div>
        </div>
      )}
    </div>
  );
}
