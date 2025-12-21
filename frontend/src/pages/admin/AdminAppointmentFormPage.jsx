import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import "../../styles/AdminAppointmentFormPage.css";

function toInputDatetime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toISOFromInput(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return d.toISOString();
}

function pickName(obj) {
  if (!obj) return "";
  if (typeof obj === "string" || typeof obj === "number") return String(obj);
  return (
    obj.full_name ||
    obj.name_ru ||
    obj.name_en ||
    obj.name ||
    obj.title ||
    obj.code ||
    ""
  );
}

function unwrapItems(resp) {
  // под разные форматы API
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.items)) return resp.items;
  if (Array.isArray(resp.results)) return resp.results;
  return [];
}

export default function AdminAppointmentFormPage({ mode }) {
  const { id } = useParams();
  const nav = useNavigate();

  const isEdit = mode === "edit" || (!!id && mode !== "create");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // fields
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [service, setService] = useState("");
  const [room, setRoom] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  // dropdown refs
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [refsLoading, setRefsLoading] = useState(false);

  const canUsePatients = patients.length > 0;
  const canUseDoctors = doctors.length > 0;
  const canUseServices = services.length > 0;
  const canUseRooms = rooms.length > 0;

  const title = isEdit ? `Edit appointment #${id}` : "New appointment";

  const loadRefs = async () => {
    setRefsLoading(true);
    try {
      const [p, d, s, r] = await Promise.all([
        adminApi.listPatients({ page: 1, page_size: 200 }),
        adminApi.listDoctors({ page: 1, page_size: 200 }),
        adminApi.listServices({ page: 1, page_size: 200 }),
        adminApi.listRooms({ page: 1, page_size: 200 }),
      ]);

      setPatients(unwrapItems(p));
      setDoctors(unwrapItems(d));
      setServices(unwrapItems(s));
      setRooms(unwrapItems(r));
    } catch {
      // refs optional — форма всё равно работает через ID
    } finally {
      setRefsLoading(false);
    }
  };

  const loadAppointment = async () => {
    if (!isEdit) return;
    setLoading(true);
    setErr(null);
    try {
      const a = await adminApi.getAppointment(id);

      // если бэк отдаёт объект — берём id, если число — как есть
      setPatient(a?.patient?.id ?? a?.patient ?? "");
      setDoctor(a?.doctor?.id ?? a?.doctor ?? "");
      setService(a?.service?.id ?? a?.service ?? "");
      setRoom(a?.room?.id ?? a?.room ?? "");

      setStartAt(toInputDatetime(a.start_at));
      setEndAt(toInputDatetime(a.end_at));
      setReason(a.reason ?? "");
      setComment(a.comment ?? "");
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
    loadAppointment();
    // eslint-disable-next-line
  }, [id]);

  const validation = useMemo(() => {
    const errors = [];
    if (!patient) errors.push("patient is required");
    if (!doctor) errors.push("doctor is required");
    if (!service) errors.push("service is required");
    if (!room) errors.push("room is required");
    if (!startAt) errors.push("start_at is required");
    if (!endAt) errors.push("end_at is required");

    if (startAt && endAt) {
      const s = new Date(startAt).getTime();
      const e = new Date(endAt).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e <= s) {
        errors.push("end_at must be after start_at");
      }
    }
    return errors;
  }, [patient, doctor, service, room, startAt, endAt]);

  const save = async (e) => {
    e.preventDefault();
    setErr(null);

    if (validation.length) {
      setErr({ detail: validation.join(", ") });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patient: patient ? Number(patient) : null,
        doctor: doctor ? Number(doctor) : null,
        service: service ? Number(service) : null,
        room: room ? Number(room) : null,
        start_at: toISOFromInput(startAt),
        end_at: toISOFromInput(endAt),
        reason: reason?.trim() || "",
        comment: comment?.trim() || "",
      };

      if (isEdit) await adminApi.patchAppointment(id, payload);
      else await adminApi.createAppointment(payload);

      nav("/admin/appointments");
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="afPage">
      <div className="afTop">
        <Link className="afBack" to="/admin/appointments">
          ← Назад
        </Link>

        <div className="afHeadRow">
          <div>
            <div className="afBreadcrumb">Записи</div>
            <h1 className="afTitle">{title}</h1>
            <div className="afSub">
              Заполни данные записи: пациент, врач, услуга, кабинет и время.
              {refsLoading ? " (списки загружаются…)" : ""}
            </div>
          </div>

          <div className="afHeadActions">
            <button
              className="afGhost"
              type="button"
              onClick={() => nav("/admin/appointments")}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="afPrimary" type="submit" form="apptForm" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {loading && <div className="afLoading">Загрузка…</div>}

        {err && (
          <div className="afError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="afCard">
        <div className="afCardTitle">Appointment form</div>

        <form id="apptForm" onSubmit={save} className="afForm">
          {/* ROW 1 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">Patient *</div>

              {canUsePatients ? (
                <select className="afControl" value={patient} onChange={(e) => setPatient(e.target.value)}>
                  <option value="">— select —</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} {pickName(p)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  placeholder="Patient ID"
                />
              )}

              {!canUsePatients && <div className="afHint">Список пациентов не загрузился — введи ID вручную.</div>}
            </div>

            <div className="afField">
              <div className="afLabel">Doctor *</div>

              {canUseDoctors ? (
                <select className="afControl" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                  <option value="">— select —</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      #{d.id} {pickName(d?.doctor_profile) || pickName(d)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  placeholder="Doctor ID"
                />
              )}

              {!canUseDoctors && <div className="afHint">Список врачей не загрузился — введи ID вручную.</div>}
            </div>
          </div>

          {/* ROW 2 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">Service *</div>

              {canUseServices ? (
                <select className="afControl" value={service} onChange={(e) => setService(e.target.value)}>
                  <option value="">— select —</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} {s.code ? `${s.code} — ` : ""}{pickName(s)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="Service ID"
                />
              )}

              {!canUseServices && <div className="afHint">Список услуг не загрузился — введи ID вручную.</div>}
            </div>

            <div className="afField">
              <div className="afLabel">Room *</div>

              {canUseRooms ? (
                <select className="afControl" value={room} onChange={(e) => setRoom(e.target.value)}>
                  <option value="">— select —</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} {pickName(r)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Room ID"
                />
              )}

              {!canUseRooms && <div className="afHint">Список кабинетов не загрузился — введи ID вручную.</div>}
            </div>
          </div>

          {/* ROW 3 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">Start *</div>
              <input
                className="afControl"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              <div className="afHint">Локальное время компьютера.</div>
            </div>

            <div className="afField">
              <div className="afLabel">End *</div>
              <input
                className="afControl"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
              <div className="afHint">End должен быть позже Start.</div>
            </div>
          </div>

          {/* ROW 4 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">Reason</div>
              <input
                className="afControl"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason"
              />
            </div>

            <div className="afField">
              <div className="afLabel">Comment</div>
              <textarea
                className="afControl afTextarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comment"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS (mobile friendly) */}
          <div className="afFooter">
            <button className="afGhost" type="button" onClick={() => nav("/admin/appointments")} disabled={saving}>
              Cancel
            </button>
            <button className="afPrimary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
