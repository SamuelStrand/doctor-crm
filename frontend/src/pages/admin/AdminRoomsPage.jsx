import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";
import "../../styles/AdminRoomsPage.css";

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const pad2 = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function parseISO(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
function formatHHMM(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function sameYMD(dateObj, ymdStr) {
  const d = ymd(dateObj);
  return d === ymdStr;
}

function getRoomIdFromAppt(a) {
  // поддержка разных форм
  if (a?.room?.id != null) return a.room.id;
  if (a?.room_id != null) return a.room_id;
  if (typeof a?.room === "number") return a.room;
  return null;
}

function getServiceLabel(a) {
  const s = a?.service;
  if (!s) return "";
  if (typeof s === "string") return s;
  return s?.name_ru || s?.name_en || s?.name || s?.code || "";
}
function getPatientLabel(a) {
  const p = a?.patient;
  if (!p) return "";
  if (typeof p === "string") return p;
  return (
    p?.full_name ||
    [p?.last_name, p?.first_name].filter(Boolean).join(" ") ||
    p?.name ||
    ""
  );
}
function getDoctorLabel(a) {
  const d = a?.doctor;
  if (!d) return "";
  if (typeof d === "string") return d;
  return (
    d?.doctor_profile?.full_name ||
    d?.full_name ||
    [d?.last_name, d?.first_name].filter(Boolean).join(" ") ||
    d?.name ||
    ""
  );
}

function getApptTitle(a) {
  const service = getServiceLabel(a) || "Запись";
  const patient = getPatientLabel(a);
  const doctor = getDoctorLabel(a);
  const who = [patient, doctor].filter(Boolean).join(", ");
  return who ? `${service} • ${who}` : service;
}

function overlaps(slotStart, slotEnd, apStart, apEnd) {
  // пересечение [slotStart,slotEnd) и [apStart,apEnd)
  return slotStart < apEnd && slotEnd > apStart;
}

export default function AdminRoomsPage() {
  // rooms
  const [rooms, setRooms] = useState([]);
  const [roomsCount, setRoomsCount] = useState(0);
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsPageSize, setRoomsPageSize] = useState(null);

  const [loadingRooms, setLoadingRooms] = useState(false);

  // appointments
  const [appts, setAppts] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // UI
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [day, setDay] = useState(ymd(new Date()));
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [timeFrom, setTimeFrom] = useState("10:00");
  const [timeTo, setTimeTo] = useState("17:00");

  const [err, setErr] = useState(null);

  // modal form rooms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [comment, setComment] = useState("");

  const roomsQuery = useMemo(() => {
    const p = { page: roomsPage };
    // если бэк умеет search — будет ок, если нет — отфильтруем локально
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [roomsPage, debouncedSearch]);

  const roomsTotalPages = useMemo(() => {
    const size = roomsPageSize || rooms.length || 1;
    return Math.max(1, Math.ceil(roomsCount / size));
  }, [roomsCount, roomsPageSize, rooms.length]);

  const safeSetRoomsPage = (n) =>
    setRoomsPage(() => Math.min(Math.max(1, n), roomsTotalPages));

  const loadRooms = async () => {
    setLoadingRooms(true);
    setErr(null);
    try {
      const data = await adminApi.listRooms(roomsQuery);
      const { items, count } = unwrapPaginated(data);
      setRooms(items);
      setRoomsCount(count ?? items.length);

      if (!roomsPageSize && items.length > 0) setRoomsPageSize(items.length);
    } catch (e) {
      const detail = e?.response?.data?.detail;
      if (detail === "Invalid page.") {
        setErr(null);
        setRoomsPage(1);
        return;
      }
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoadingRooms(false);
    }
  };

  // ВАЖНО: listAppointments у тебя есть. Мы попробуем:
  // 1) передать date_from/date_to (если бэк поддерживает — супер)
  // 2) если бэк игнорит — всё равно отфильтруем по day на фронте
  // + подтянем несколько страниц (до 10), чтобы не упереться в page=1
  const loadAppointmentsForDay = async () => {
    setLoadingAppts(true);
    setErr(null);

    try {
      const dayStart = new Date(`${day}T00:00:00`);
      const dayEnd = new Date(`${day}T23:59:59`);

      const collected = [];
      const MAX_PAGES = 10;

      for (let p = 1; p <= MAX_PAGES; p++) {
        const data = await adminApi.listAppointments({
          page: p,
          // если у тебя на бэке есть фильтры — они начнут работать без изменений
          date_from: dayStart.toISOString(),
          date_to: dayEnd.toISOString(),
          // иногда DRF разрешает page_size
          page_size: 200,
        });

        const { items } = unwrapPaginated(data);
        if (!items || items.length === 0) break;

        collected.push(...items);

        // эвристика: если пришло меньше page_size — значит страниц больше нет
        if (items.length < 200) break;
      }

      // финальная фильтрация по выбранной дате (на случай если фильтры не поддерживаются бэком)
      const filtered = collected.filter((a) => {
        const start = parseISO(a.start_at);
        return start && sameYMD(start, day);
      });

      setAppts(filtered);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
      setAppts([]);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line
  }, [roomsQuery]);

  useEffect(() => {
    loadAppointmentsForDay();
    // eslint-disable-next-line
  }, [day]);

  const viewRooms = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => {
      const txt = `${r.name || ""} ${r.floor ?? ""} ${r.comment || ""}`.toLowerCase();
      return txt.includes(q);
    });
  }, [rooms, debouncedSearch]);

  const slots = useMemo(() => {
    // строим даты-слоты в выбранный day
    const [fh, fm] = timeFrom.split(":").map(Number);
    const [th, tm] = timeTo.split(":").map(Number);

    const start = new Date(`${day}T00:00:00`);
    start.setHours(fh, fm, 0, 0);

    const end = new Date(`${day}T00:00:00`);
    end.setHours(th, tm, 0, 0);

    const arr = [];
    for (let t = start.getTime(); t < end.getTime(); t += slotMinutes * 60 * 1000) {
      arr.push(new Date(t));
    }
    return arr;
  }, [day, timeFrom, timeTo, slotMinutes]);

  // appts grouped by roomId
  const apptsByRoom = useMemo(() => {
    const m = new Map(); // roomId -> array appointments
    for (const a of appts) {
      const roomId = getRoomIdFromAppt(a);
      if (!roomId) continue;
      if (!m.has(roomId)) m.set(roomId, []);
      m.get(roomId).push(a);
    }
    return m;
  }, [appts]);

  // ---- room CRUD modal
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setFloor("");
    setComment("");
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setName(r.name ?? "");
    setFloor(r.floor ?? "");
    setComment(r.comment ?? "");
    setIsModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) {
      setErr({ detail: "name is required" });
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        floor: floor === "" ? null : Number(floor),
        comment: comment.trim() || null,
      };

      if (!editingId) await adminApi.createRoom(payload);
      else await adminApi.patchRoom(editingId, payload);

      setIsModalOpen(false);
      resetForm();
      await loadRooms();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete room?")) return;
    setErr(null);
    try {
      await adminApi.deleteRoom(id);
      await loadRooms();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  const isLoading = loadingRooms || loadingAppts;

  return (
    <div className="rPage">
      <div className="rTop">
        <div className="rBreadcrumb">Кабинеты</div>
        <h1 className="rTitle">Кабинеты</h1>

        <div className="rToolbar">
          <div className="rSearch">
            <span className="rIcon" aria-hidden="true">
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
              className="rSearchInput"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setRoomsPage(1);
              }}
              placeholder="Поиск кабинета"
            />
          </div>

          <label className="rChip">
            <span>Дата</span>
            <input className="rDate" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </label>

          <label className="rChip">
            <span>С</span>
            <input className="rTime" type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
          </label>

          <label className="rChip">
            <span>До</span>
            <input className="rTime" type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
          </label>

          <label className="rChip">
            <span>Шаг</span>
            <select className="rSelectSmall" value={slotMinutes} onChange={(e) => setSlotMinutes(Number(e.target.value))}>
              <option value={15}>15 мин</option>
              <option value={30}>30 мин</option>
              <option value={60}>60 мин</option>
            </select>
          </label>

          <button className="rAddBtn" type="button" onClick={openCreate}>
            <span className="rAddPlus">+</span>
            Добавить кабинет
          </button>
        </div>

        <div className="rMeta">
          <span>Всего: {roomsCount}</span>
          {isLoading && <span className="rLoading">Загрузка…</span>}
          <span className="rLegend">
            <span className="rLegendDot busy" /> Занято
            <span className="rLegendDot free" /> Свободно
          </span>
        </div>

        {err && (
          <div className="rError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="rTableWrap">
        <table className="rTable">
          <thead>
            <tr>
              <th className="rThSticky">Кабинет</th>
              {slots.map((t) => (
                <th key={t.toISOString()} className="rTh">
                  {formatHHMM(t)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {viewRooms.map((room) => {
              const roomAppts = apptsByRoom.get(room.id) || [];

              return (
                <tr key={room.id}>
                  <td className="rTdSticky">
                    <div className="rRoomCell">
                      <div className="rRoomName">{room.name}</div>
                      <div className="rRoomMeta">
                        <span>{room.floor != null ? `Этаж ${room.floor}` : "—"}</span>
                        {room.comment ? <span className="rDot">•</span> : null}
                        {room.comment ? <span className="rRoomComment">{room.comment}</span> : null}
                      </div>

                      <div className="rRoomActions">
                        <button className="rMiniBtn" type="button" onClick={() => startEdit(room)}>
                          Edit
                        </button>
                        <button className="rMiniBtn danger" type="button" onClick={() => remove(room.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>

                  {slots.map((slotStart) => {
                    const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);

                    // ищем запись, которая пересекает слот
                    let hit = null;
                    for (const a of roomAppts) {
                      const aStart = parseISO(a.start_at);
                      const aEnd = parseISO(a.end_at) || (aStart ? new Date(aStart.getTime() + 30 * 60 * 1000) : null);
                      if (!aStart || !aEnd) continue;
                      if (overlaps(slotStart, slotEnd, aStart, aEnd)) {
                        hit = a;
                        break;
                      }
                    }

                    return (
                      <td key={`${room.id}_${slotStart.toISOString()}`} className="rTd">
                        {hit ? (
                          <div className="rBusy" title={getApptTitle(hit)}>
                            <div className="rBusyTitle">{getServiceLabel(hit) || "Запись"}</div>
                            <div className="rBusySub">
                              {getPatientLabel(hit) || getDoctorLabel(hit) || ""}
                            </div>
                          </div>
                        ) : (
                          <div className="rFree" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {!loadingRooms && viewRooms.length === 0 && (
              <tr>
                <td className="rEmptyRow" colSpan={1 + slots.length}>
                  Кабинетов нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rPager">
        <button className="rPagerBtn" disabled={roomsPage <= 1 || loadingRooms} onClick={() => safeSetRoomsPage(roomsPage - 1)}>
          ‹ Previous
        </button>
        <span className="rPagerInfo">
          {roomsPage} / {roomsTotalPages}
        </span>
        <button
          className="rPagerBtn"
          disabled={roomsPage >= roomsTotalPages || loadingRooms}
          onClick={() => safeSetRoomsPage(roomsPage + 1)}
        >
          Next ›
        </button>
      </div>

      {isModalOpen && (
        <div className="rModalOverlay" role="dialog" aria-modal="true">
          <div className="rModal">
            <div className="rModalHead">
              <div className="rModalTitle">{editingId ? `Редактировать кабинет #${editingId}` : "Добавить кабинет"}</div>
              <button className="rModalClose" type="button" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={submit} className="rForm">
              <div className="rFormGrid2">
                <label className="rField">
                  <span>Название *</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="rField">
                  <span>Этаж</span>
                  <input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
                </label>
              </div>

              <label className="rField">
                <span>Комментарий</span>
                <input value={comment} onChange={(e) => setComment(e.target.value)} />
              </label>

              <div className="rFormActions">
                <button className="rPrimary" type="submit">
                  {editingId ? "Сохранить" : "Создать"}
                </button>
                <button
                  className="rGhost"
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
