import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import "../../styles/AdminAppointmentDetailPage.css";

function formatDT(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yy} ${hh}:${mi}`;
}

function statusLabel(st) {
  if (!st) return "—";
  const map = {
    SCHEDULED: "Scheduled",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    NO_SHOW: "No show",
  };
  return map[st] || st;
}

export default function AdminAppointmentDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [a, setA] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.getAppointment(id);
      setA(data);
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

  const del = async () => {
    if (!confirm("Delete this appointment?")) return;
    setDeleting(true);
    setErr(null);
    try {
      await adminApi.deleteAppointment(id);
      nav("/admin/appointments");
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setDeleting(false);
    }
  };

  const summary = useMemo(() => {
    if (!a) return null;

    const patient = a?.patient;
    const doctor = a?.doctor;
    const service = a?.service;
    const room = a?.room;

    const patientName =
      typeof patient === "object"
        ? patient?.full_name || [patient?.last_name, patient?.first_name].filter(Boolean).join(" ")
        : patient;

    const doctorName =
      typeof doctor === "object"
        ? doctor?.doctor_profile?.full_name ||
          doctor?.full_name ||
          [doctor?.last_name, doctor?.first_name].filter(Boolean).join(" ")
        : doctor;

    const serviceName =
      typeof service === "object" ? service?.name_ru || service?.name_en || service?.name || service?.code : service;

    const roomName = typeof room === "object" ? room?.name || room?.id : room;

    return {
      start: formatDT(a.start_at),
      end: formatDT(a.end_at),
      status: a.status,
      patient: patientName || "—",
      doctor: doctorName || "—",
      service: serviceName || "—",
      room: roomName || "—",
      reason: a.reason ?? "—",
      comment: a.comment ?? a.notes ?? "—",
    };
  }, [a]);

  return (
    <div className="adPage">
      <div className="adTop">
        <Link className="adBack" to="/admin/appointments">
          ← Назад к списку
        </Link>

        <div className="adHeadRow">
          <div>
            <div className="adBreadcrumb">Записи</div>
            <h1 className="adTitle">Appointment #{id}</h1>
          </div>

          <div className="adHeadActions">
            <Link className="adBtn" to={`/admin/appointments/${id}/edit`}>
              Edit
            </Link>
            <button className="adBtn danger" onClick={del} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {loading && <div className="adLoading">Загрузка…</div>}

        {err && (
          <div className="adError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      {a && summary && (
        <div className="adGridSingle">
          <div className="adCard">
            <div className="adCardTitle">Summary</div>

            <div className="adSummary">
              <div className="adRow">
                <div className="adLabel">Status</div>
                <div className="adValue">
                  <span className={`adBadge ${summary.status || ""}`}>{statusLabel(summary.status)}</span>
                </div>
              </div>

              <div className="adRow">
                <div className="adLabel">Start</div>
                <div className="adValue">{summary.start}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">End</div>
                <div className="adValue">{summary.end}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">Patient</div>
                <div className="adValue">{summary.patient}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">Doctor</div>
                <div className="adValue">{summary.doctor}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">Service</div>
                <div className="adValue">{summary.service}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">Room</div>
                <div className="adValue">{summary.room}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">Reason</div>
                <div className="adValue adEllipsis" title={summary.reason}>
                  {summary.reason}
                </div>
              </div>

              <div className="adRow adRowTall">
                <div className="adLabel">Comment</div>
                <div className="adValue adMulti">{summary.comment}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
