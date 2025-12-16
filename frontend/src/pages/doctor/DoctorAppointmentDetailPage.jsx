import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";

export default function DoctorAppointmentDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [a, setA] = useState(null);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await doctorApi.getAppointment(id);
      setA(data);
      setStatus(data?.status ?? "");
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line

  const currentStatus = a?.status ?? "";

  // ✅ логика переходов под твои ошибки:
  // SCHEDULED -> только CONFIRMED
  // CONFIRMED -> COMPLETED / NO_SHOW / CANCELLED (если бэк разрешит)
  const allowedTargets = useMemo(() => {
    if (currentStatus === "SCHEDULED") return ["CONFIRMED"];
    if (currentStatus === "CONFIRMED") return ["COMPLETED", "NO_SHOW", "CANCELLED"];
    return [];
  }, [currentStatus]);

  const saveStatus = async (nextStatus) => {
    setErr(null);
    setSavingStatus(true);
    try {
      await doctorApi.setStatus(Number(id), nextStatus);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setSavingStatus(false);
    }
  };

  const openOrCreateNote = async () => {
    setErr(null);
    try {
      const existing = await doctorApi.findVisitNoteByAppointment(Number(id));
      if (existing?.id) {
        nav(`/doctor/visit-notes/${existing.id}`);
        return;
      }
      const created = await doctorApi.createVisitNote({
        appointment: Number(id),
        note_text: "-",
      });
      nav(`/doctor/visit-notes/${created.id}`);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/doctor/appointments">← Back</Link>
        <h2 style={{ margin: 0 }}>Appointment #{id}</h2>
      </div>

      {loading && <p>Loading…</p>}
      {err && (
        <pre style={{ background: "#eee", padding: 12 }}>
          {JSON.stringify(err, null, 2)}
        </pre>
      )}

      {a && (
        <>
          <pre style={{ background: "#f6f6f6", padding: 12 }}>
            {JSON.stringify(a, null, 2)}
          </pre>

          <div style={{ marginTop: 12 }}>
            <b>Current:</b> {currentStatus}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <b>Change to:</b>

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">-- select --</option>
              {allowedTargets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={() => saveStatus(status)}
              disabled={!status || savingStatus || allowedTargets.length === 0}
            >
              {savingStatus ? "Saving..." : "Save status"}
            </button>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allowedTargets.includes("CONFIRMED") && (
              <button onClick={() => saveStatus("CONFIRMED")} disabled={savingStatus}>
                Confirm
              </button>
            )}
            {allowedTargets.includes("COMPLETED") && (
              <button onClick={() => saveStatus("COMPLETED")} disabled={savingStatus}>
                Complete
              </button>
            )}
            {allowedTargets.includes("NO_SHOW") && (
              <button onClick={() => saveStatus("NO_SHOW")} disabled={savingStatus}>
                No show
              </button>
            )}
            {allowedTargets.includes("CANCELLED") && (
              <button onClick={() => saveStatus("CANCELLED")} disabled={savingStatus}>
                Cancel
              </button>
            )}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link to={`/doctor/visit-notes?appointment=${id}`}>Visit notes list (filtered)</Link>
            <button onClick={openOrCreateNote}>Open / Create note</button>
          </div>
        </>
      )}
    </div>
  );
}
