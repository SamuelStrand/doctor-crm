import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/adminApi";

function toInputDatetime(iso) {
  // iso -> "YYYY-MM-DDTHH:mm"
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toISOFromInput(dt) {
  // "YYYY-MM-DDTHH:mm" -> ISO
  if (!dt) return null;
  const d = new Date(dt);
  return d.toISOString();
}

export default function AdminAppointmentFormPage({ mode }) {
  const { id } = useParams();
  const nav = useNavigate();

  const isEdit = mode === "edit" || (!!id && mode !== "create");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // поля (минимум)
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [service, setService] = useState("");
  const [room, setRoom] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  // для удобных dropdown (если хочешь оставить просто ID — можешь убрать)
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [rooms, setRooms] = useState([]);

  const loadRefs = async () => {
    try {
      const [p, d, s, r] = await Promise.all([
        adminApi.listPatients({ page_size: 100 }),
        adminApi.listDoctors({ page_size: 100 }),
        adminApi.listServices({ page_size: 100 }),
        adminApi.listRooms({ page_size: 100 }),
      ]);

      setPatients(p?.results ?? p ?? []);
      setDoctors(d?.results ?? d ?? []);
      setServices(s?.results ?? s ?? []);
      setRooms(r?.results ?? r ?? []);
    } catch {
      // refs optional — если не подгрузились, форма всё равно работает через ID
    }
  };

  const loadAppointment = async () => {
    if (!isEdit) return;
    setLoading(true);
    setErr(null);
    try {
      const a = await adminApi.getAppointment(id);

      setPatient(a.patient ?? "");
      setDoctor(a.doctor ?? "");
      setService(a.service ?? "");
      setRoom(a.room ?? "");
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

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    try {
      const payload = {
        patient: patient ? Number(patient) : null,
        doctor: doctor ? Number(doctor) : null,
        service: service ? Number(service) : null,
        room: room ? Number(room) : null,
        start_at: toISOFromInput(startAt),
        end_at: toISOFromInput(endAt),
        reason,
        comment,
      };

      if (isEdit) {
        await adminApi.patchAppointment(id, payload);
      } else {
        await adminApi.createAppointment(payload);
      }

      nav("/admin/appointments");
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/admin/appointments">← Back</Link>
        <h2 style={{ margin: 0 }}>
          Admin • {isEdit ? `Edit appointment #${id}` : "New appointment"}
        </h2>
      </div>

      {loading && <p>Loading…</p>}
      {err && (
        <pre style={{ background: "#eee", padding: 12 }}>
          {JSON.stringify(err, null, 2)}
        </pre>
      )}

      <form onSubmit={save} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <label>
          Patient:
          <select value={patient} onChange={(e) => setPatient(e.target.value)}>
            <option value="">-- select --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} {p.full_name ?? p.name ?? ""}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: "#666" }}>Если список пуст — впиши ID вручную ниже.</div>
          <input
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Patient ID"
          />
        </label>

        <label>
          Doctor:
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
            <option value="">-- select --</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                #{d.id} {d.full_name ?? d.name ?? ""} {d.specialization ? `(${d.specialization})` : ""}
              </option>
            ))}
          </select>
          <input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Doctor ID" />
        </label>

        <label>
          Service:
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">-- select --</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                #{s.id} {s.code ?? ""} {s.name ?? ""}
              </option>
            ))}
          </select>
          <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service ID" />
        </label>

        <label>
          Room:
          <select value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="">-- select --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.id} {r.name ?? r.number ?? ""}
              </option>
            ))}
          </select>
          <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room ID" />
        </label>

        <label>
          Start:
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </label>

        <label>
          End:
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </label>

        <label>
          Reason:
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
        </label>

        <label>
          Comment:
          <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment" />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
