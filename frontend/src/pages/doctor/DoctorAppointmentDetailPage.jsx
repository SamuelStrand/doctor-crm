import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { useTranslation } from "react-i18next";
import "../../styles/DoctorAppointmentDetailPage.css";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function fmtDT(iso, emptyDash = "—") {
  if (!iso) return emptyDash;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function pickName(v, emptyDash = "—") {
  if (!v) return emptyDash;
  if (typeof v === "string" || typeof v === "number") return String(v);
  return (
    v.full_name ||
    v.name ||
    v.name_ru ||
    v.name_en ||
    v.title ||
    v.email ||
    v.phone ||
    (v.id != null ? `#${v.id}` : emptyDash)
  );
}

export default function DoctorAppointmentDetailPage() {
  const { t } = useTranslation();
  const emptyDash = t("common.emptyDash");

  const { id } = useParams();
  const nav = useNavigate();

  const [a, setA] = useState(null);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const statusLabel = (st) =>
    t(`doctor.appointments.status.${String(st || "").toUpperCase()}`, {
      defaultValue: st || emptyDash,
    });

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
    if (currentStatus === "CONFIRMED")
      return ["COMPLETED", "NO_SHOW", "CANCELLED"];
    return [];
  }, [currentStatus]);

  const saveStatus = async (nextStatus) => {
    if (!nextStatus) return;
    setErr(null);
    setSavingStatus(true);
    try {
      await doctorApi.setStatus(Number(id), nextStatus);
      await load();
      setStatus(""); // сброс селекта
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

  const start = fmtDT(a?.start_at || a?.start, emptyDash);
  const end = fmtDT(a?.end_at || a?.end, emptyDash);

  const patient = a?.patient_name ?? pickName(a?.patient, emptyDash);
  const doctor = a?.doctor_name ?? pickName(a?.doctor, emptyDash);
  const service = pickName(a?.service, emptyDash);
  const room = pickName(a?.room, emptyDash);

  return (
    <div className="dadPage">
      <div className="dadTop">
        <div className="dadBackRow">
          <Link className="dadBack" to="/doctor/appointments">
            {t("doctor.appointmentDetail.back")}
          </Link>

          <div className="dadHead">
            <div className="dadBreadcrumb">
              {t("doctor.appointmentDetail.breadcrumb")}
            </div>
            <h1 className="dadTitle">
              {t("doctor.appointmentDetail.title")}{" "}
              <span className="dadMono">#{id}</span>
            </h1>
          </div>

          <div className="dadRightPill">
            <span className={`dadBadge ${currentStatus || ""}`}>
              {statusLabel(currentStatus)}
            </span>
          </div>
        </div>

        {loading && <div className="dadLoading">{t("common.loading")}</div>}

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
            <div className="dadCardTitle">
              {t("doctor.appointmentDetail.details.title")}
            </div>

            <div className="dadRows">
              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.start")}
                </div>
                <div className="dadValue">{start}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.end")}
                </div>
                <div className="dadValue">{end}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.patient")}
                </div>
                <div className="dadValue">{patient}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.doctor")}
                </div>
                <div className="dadValue">{doctor || emptyDash}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.service")}
                </div>
                <div className="dadValue">{service}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.room")}
                </div>
                <div className="dadValue">{room}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.reason")}
                </div>
                <div className="dadValue">{a?.reason || emptyDash}</div>
              </div>

              <div className="dadRow">
                <div className="dadLabel">
                  {t("doctor.appointmentDetail.details.comment")}
                </div>
                <div className="dadValue">{a?.comment || emptyDash}</div>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="dadCard">
            <div className="dadCardTitle">
              {t("doctor.appointmentDetail.actions.title")}
            </div>

            <div className="dadSection">
              <div className="dadSectionTitle">
                {t("doctor.appointmentDetail.actions.changeStatus")}
              </div>

              <div className="dadFormRow">
                <select
                  className="dadSelect"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={allowedTargets.length === 0 || savingStatus}
                >
                  <option value="">
                    {t("doctor.appointmentDetail.actions.selectPlaceholder")}
                  </option>
                  {allowedTargets.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>

                <button
                  className="dadPrimary"
                  onClick={() => saveStatus(status)}
                  disabled={!status || savingStatus || allowedTargets.length === 0}
                  type="button"
                >
                  {savingStatus ? t("common.saving") : t("common.save")}
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
                    {t("doctor.appointmentDetail.actions.quick.confirm")}
                  </button>
                )}
                {allowedTargets.includes("COMPLETED") && (
                  <button
                    className="dadPrimary"
                    onClick={() => saveStatus("COMPLETED")}
                    disabled={savingStatus}
                    type="button"
                  >
                    {t("doctor.appointmentDetail.actions.quick.complete")}
                  </button>
                )}
                {allowedTargets.includes("NO_SHOW") && (
                  <button
                    className="dadGhost warn"
                    onClick={() => saveStatus("NO_SHOW")}
                    disabled={savingStatus}
                    type="button"
                  >
                    {t("doctor.appointmentDetail.actions.quick.noShow")}
                  </button>
                )}
                {allowedTargets.includes("CANCELLED") && (
                  <button
                    className="dadGhost danger"
                    onClick={() => saveStatus("CANCELLED")}
                    disabled={savingStatus}
                    type="button"
                  >
                    {t("doctor.appointmentDetail.actions.quick.cancel")}
                  </button>
                )}
              </div>

              {allowedTargets.length === 0 && (
                <div className="dadHint">
                  {t("doctor.appointmentDetail.actions.cannotChange", {
                    status: currentStatus || emptyDash,
                  })}
                </div>
              )}
            </div>

            <div className="dadDivider" />

            <div className="dadSection">
              <div className="dadSectionTitle">
                {t("doctor.appointmentDetail.visitNotes.title")}
              </div>

              <div className="dadQuick">
                <Link
                  className="dadLinkPill"
                  to={`/doctor/visit-notes?appointment=${id}`}
                >
                  {t("doctor.appointmentDetail.visitNotes.list")}
                </Link>

                <button
                  className="dadPrimary"
                  onClick={openOrCreateNote}
                  type="button"
                >
                  {t("doctor.appointmentDetail.visitNotes.openOrCreate")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
