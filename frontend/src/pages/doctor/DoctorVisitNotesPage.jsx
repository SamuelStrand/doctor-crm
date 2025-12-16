import React, { useEffect, useMemo, useState } from "react";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";
import { Link, useSearchParams } from "react-router-dom";

export default function DoctorVisitNotesPage() {
  const [sp] = useSearchParams();
  const prefillAppointment = sp.get("appointment") || "";

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [appointment, setAppointment] = useState(prefillAppointment);
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState(null);

  const appointmentIdNum = useMemo(() => {
    const v = String(appointment || "").trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [appointment]);

  // 1) Подтягиваем инфу по appointment (чтобы видеть patient)
  useEffect(() => {
    let cancelled = false;

    async function loadAppointment() {
      setAppointmentInfo(null);
      if (!appointmentIdNum) return;

      try {
        const a = await doctorApi.getAppointment(appointmentIdNum);
        if (!cancelled) setAppointmentInfo(a);
      } catch (e) {
        if (!cancelled) {
          setErr(e?.response?.data ?? { detail: e.message });
        }
      }
    }

    loadAppointment();
    return () => {
      cancelled = true;
    };
  }, [appointmentIdNum]);

  // 2) Грузим список заметок (опционально фильтруем по appointment)
  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // если бэк поддерживает ?appointment= (у тебя в Postman оно работает)
      const data = await doctorApi.listVisitNotes({
        page,
        appointment: appointmentIdNum ?? undefined,
      });

      const { items, count } = unwrapPaginated(data);
      setItems(items);
      setCount(count);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page, appointmentIdNum]);

  // 3) Создание заметки
  const create = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!appointmentIdNum) {
      setErr({ appointment: ["Enter valid Appointment ID"] });
      return;
    }
    if (!noteText.trim()) {
      setErr({ note_text: ["This field is required."] });
      return;
    }

    // если у appointment нет пациента — создавать бессмысленно (и бэк упадёт)
    const patientFromAppointment =
      appointmentInfo?.patient ?? appointmentInfo?.patient_id ?? null;

    if (!patientFromAppointment) {
      setErr({
        patient: [
          "Selected appointment has no patient. Pick an appointment that has a patient.",
        ],
      });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        appointment: appointmentIdNum,
        note_text: noteText, // важно: note_text :contentReference[oaicite:2]{index=2}
        // patient НЕ шлём: в схеме он readOnly :contentReference[oaicite:3]{index=3}
      };

      await doctorApi.createVisitNote(payload);
      setNoteText("");
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    } finally {
      setCreating(false);
    }
  };

  const patientLabel =
    appointmentInfo?.patient_name ||
    appointmentInfo?.patient?.full_name ||
    (appointmentInfo?.patient ? `Patient #${appointmentInfo.patient}` : null);

  return (
    <div style={{ padding: 20 }}>
      <h2>Doctor • Visit notes</h2>

      <form
        onSubmit={create}
        style={{
          display: "grid",
          gap: 8,
          maxWidth: 640,
          marginBottom: 16,
        }}
      >
        <input
          value={appointment}
          onChange={(e) => setAppointment(e.target.value)}
          placeholder="Appointment ID (например 1)"
        />

        {appointmentIdNum && (
          <div style={{ fontSize: 14, opacity: 0.85 }}>
            Appointment: <b>{appointmentIdNum}</b>
            {" · "}
            Patient: <b>{patientLabel ?? "—"}</b>
          </div>
        )}

        <textarea
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Note text..."
        />

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create note"}
        </button>
      </form>

      {err && (
        <pre style={{ background: "#eee", padding: 12 }}>
          {JSON.stringify(err, null, 2)}
        </pre>
      )}
      {loading && <p>Loading…</p>}

      {!loading && (
        <>
          <table
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Appointment</th>
                <th>Patient</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td>{n.appointment ?? "-"}</td>
                  <td>{n.patient ?? "-"}</td>
                  <td>{n.created_at ?? "-"}</td>
                  <td>
                    <Link to={`/doctor/visit-notes/${n.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5">No notes</td>
                </tr>
              )}
            </tbody>
          </table>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span>Page {page}</span>
            <button
              disabled={items.length === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
            <span style={{ marginLeft: "auto" }}>Total: {count}</span>
          </div>
        </>
      )}
    </div>
  );
}
