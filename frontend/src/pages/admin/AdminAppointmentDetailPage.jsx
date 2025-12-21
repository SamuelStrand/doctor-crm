import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import "../../styles/AdminAppointmentDetailPage.css";
import { useTranslation } from "react-i18next";

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

export default function AdminAppointmentDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "ru").slice(0, 2);

  const { id } = useParams();
  const nav = useNavigate();

  const [a, setA] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusLabel = (st) => {
    if (!st) return "—";
    const map = {
      SCHEDULED: t("admin.appointments.status.scheduled"),
      CONFIRMED: t("admin.appointments.status.confirmed"),
      COMPLETED: t("admin.appointments.status.completed"),
      CANCELLED: t("admin.appointments.status.cancelled"),
      NO_SHOW: t("admin.appointments.status.noShow"),
    };
    return map[st] || st;
  };

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
    if (!confirm(t("admin.apptDetail.confirmDelete"))) return;
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

    let serviceName = "—";
    if (typeof service === "object") {
      if (lang === "ru") serviceName = service?.name_ru || service?.name_en || service?.name_kk || service?.name || service?.code;
      else if (lang === "en") serviceName = service?.name_en || service?.name_ru || service?.name_kk || service?.name || service?.code;
      else if (lang === "kk") serviceName = service?.name_kk || service?.name_ru || service?.name_en || service?.name || service?.code;
      else serviceName = service?.name_ru || service?.name_en || service?.name_kk || service?.name || service?.code;
    } else {
      serviceName = service ?? "—";
    }

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
  }, [a, lang]);

  return (
    <div className="adPage">
      <div className="adTop">
        <Link className="adBack" to="/admin/appointments">
          ← {t("admin.apptDetail.backToList")}
        </Link>

        <div className="adHeadRow">
          <div>
            <div className="adBreadcrumb">{t("admin.appointments.breadcrumb")}</div>
            <h1 className="adTitle">{t("admin.apptDetail.title", { id })}</h1>
          </div>

          <div className="adHeadActions">
            <Link className="adBtn" to={`/admin/appointments/${id}/edit`}>
              {t("admin.apptDetail.actions.edit")}
            </Link>
            <button className="adBtn danger" onClick={del} disabled={deleting}>
              {deleting ? t("admin.apptDetail.actions.deleting") : t("admin.apptDetail.actions.delete")}
            </button>
          </div>
        </div>

        {loading && <div className="adLoading">{t("common.loading")}</div>}

        {err && (
          <div className="adError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      {a && summary && (
        <div className="adGridSingle">
          <div className="adCard">
            <div className="adCardTitle">{t("admin.apptDetail.summaryTitle")}</div>

            <div className="adSummary">
              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.status")}</div>
                <div className="adValue">
                  <span className={`adBadge ${summary.status || ""}`}>{statusLabel(summary.status)}</span>
                </div>
              </div>

              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.start")}</div>
                <div className="adValue">{summary.start}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.end")}</div>
                <div className="adValue">{summary.end}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.patient")}</div>
                <div className="adValue">{summary.patient}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.doctor")}</div>
                <div className="adValue">{summary.doctor}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.service")}</div>
                <div className="adValue">{summary.service}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.room")}</div>
                <div className="adValue">{summary.room}</div>
              </div>

              <div className="adRow">
                <div className="adLabel">{t("admin.apptDetail.labels.reason")}</div>
                <div className="adValue adEllipsis" title={summary.reason}>
                  {summary.reason}
                </div>
              </div>

              <div className="adRow adRowTall">
                <div className="adLabel">{t("admin.apptDetail.labels.comment")}</div>
                <div className="adValue adMulti">{summary.comment}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
