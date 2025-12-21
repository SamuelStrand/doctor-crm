import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import "../../styles/DoctorAppointmentDetailPage.css";

function pad2(n) {
  return String(n).padStart(2, "0");
}
function fmtDT(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
function statusLabel(st) {
  const map = {
    SCHEDULED: "Scheduled",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    NO_SHOW: "No show",
  };
  return map[st] || st || "—";
}
function pickName(v) {
  if (!v) return "—";
  if (typeof v === "string" || typeof v === "number") return String(v);
  return (
    v.full_name ||
    v.name ||
    v.name_ru ||
    v.name_en ||
    v.title ||
    v.email ||
    v.phone ||
    (v.id != null ? `#${v.id}` : "—")
  );
}

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
    // eslint-disable-next-line
  }, [id]);

  const currentStatus = a?.status ?? "";

  // SCHEDULED -> CONFIRMED
  // CONFIRMED -> COMPLETED / NO_SHOW / CANCELLED
  const allowedTargets = useMemo(() => {
    if (currentStatus === "SCHEDULED") return ["CONFIRMED"];
    if (currentStatus === "CONFIRMED") return ["COMPLETED", "NO_SHOW", "CANCELLED"];
    return [];
  }, [currentStatus]);

  const saveStatus = async (nextStatus) => {
    if (!nextStatus) return;
    setErr(null);
    setSavingStatus(true);
    try {
      await doctorApi.setStatus(Number(id), nextStatus);
      await load();
      setStatus(""); // чтобы после сохранения селект сбросился
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

  const start = fmtDT(a?.start_at || a?.start);
  const end = fmtDT(a?.end_at || a?.end);

  const patient = a?.patient_name ?? pickName(a?.patient);
  const doctor = a?.doctor_name ?? pickName(a?.doctor);
  const service = pickName(a?.service);
  const room = pickName(a?.room);

  return (
    <div className="dadPage">
      <div className="dadTop">
        <div className="dadBackRow">
          <Link className="dadBack" to="/doctor/appointments">
            ← Back
          </Link>

          <div className="dadHead">
            <div className="dadBreadcrumb">Doctor</div>
            <h1 className="dadTitle">
              Appointment <span className="dadMono">#{id}</span>
            </h1>
          </div>

          <div className="dadRightPill">
            <span className={`dadBadge ${currentStatus || ""}`}>
              {statusLabel(currentStatus)}
            </span>
          </div>
        </div>

        {loading && <div className="dadLoading">Loading…</div>}

        {err && (
          <div className="dadError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      {a && !loading && (
        <div className="dadGrid">
          {/* main info */}
          <div className="dadCard">
            <div className="dadCardTitle">Details</div>

            <div className="dadRows">
              <div className="dadRow">
                <div className="dadLabel">Start</div>
                <div className="dadValue">{start}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">End</div>
                <div className="dadValue">{end}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">Patient</div>
                <div className="dadValue">{patient}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">Doctor</div>
                <div className="dadValue">{doctor || "—"}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">Service</div>
                <div className="dadValue">{service}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">Room</div>
                <div className="dadValue">{room}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">Reason</div>
                <div className="dadValue">{a?.reason || "—"}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">Comment</div>
                <div className="dadValue">{a?.comment || "—"}</div>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="dadCard">
            <div className="dadCardTitle">Actions</div>

            <div className="dadSection">
              <div className="dadSectionTitle">Change status</div>

              <div className="dadFormRow">
                <select
                  className="dadSelect"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={allowedTargets.length === 0 || savingStatus}
                >
                  <option value="">-- select --</option>
                  {allowedTargets.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  className="dadPrimary"
                  onClick={() => saveStatus(status)}
                  disabled={!status || savingStatus || allowedTargets.length === 0}
                  type="button"
                >
                  {savingStatus ? "Saving…" : "Save"}
                </button>
              </div>

              <div className="dadQuick">
                {allowedTargets.includes("CONFIRMED") && (
                  <button
                    className="dadPrimary"
                    onClick={() => saveStatus("CONFIRMED")}
                    disabled={savingStatus}
                    type="button"
                  >
                    Confirm
                  </button>
                )}
                {allowedTargets.includes("COMPLETED") && (
                  <button
                    className="dadPrimary"
                    onClick={() => saveStatus("COMPLETED")}
                    disabled={savingStatus}
                    type="button"
                  >
                    Complete
                  </button>
                )}
                {allowedTargets.includes("NO_SHOW") && (
                  <button
                    className="dadGhost warn"
                    onClick={() => saveStatus("NO_SHOW")}
                    disabled={savingStatus}
                    type="button"
                  >
                    No show
                  </button>
                )}
                {allowedTargets.includes("CANCELLED") && (
                  <button
                    className="dadGhost danger"
                    onClick={() => saveStatus("CANCELLED")}
                    disabled={savingStatus}
                    type="button"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {allowedTargets.length === 0 && (
                <div className="dadHint">
                  Status cannot be changed from <b>{currentStatus || "—"}</b>.
                </div>
              )}
            </div>

            <div className="dadDivider" />

            <div className="dadSection">
              <div className="dadSectionTitle">Visit notes</div>

              <div className="dadQuick">
                <Link className="dadLinkPill" to={`/doctor/visit-notes?appointment=${id}`}>
                  Notes list
                </Link>

                <button className="dadPrimary" onClick={openOrCreateNote} type="button">
                  Open / Create note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
