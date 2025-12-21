import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { useTranslation } from "react-i18next";
import "../../styles/DoctorPatientDetailPage.css";

function initialsFromName(name, emptyDash = "—") {
  const s = String(name || "").trim();
  if (!s) return emptyDash;
  const parts = s.split(/\s+/).filter(Boolean);
  const a = (parts[0]?.[0] || "").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return (a + b) || a || emptyDash;
}

function fmtDate(d, emptyDash = "—") {
  if (!d) return emptyDash;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`;
}

function fmtDateTime(d, emptyDash = "—") {
  if (!d) return emptyDash;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()} ${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
}

function normalizeList(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (Array.isArray(x.results)) return x.results;
  if (Array.isArray(x.items)) return x.items;
  if (Array.isArray(x.visits)) return x.visits;
  if (Array.isArray(x.appointments)) return x.appointments;
  return [];
}

export default function DoctorPatientDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const emptyDash = t("common.emptyDash");

  const [tab, setTab] = useState("profile"); // profile | history
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const p = await doctorApi.getPatient(id);
      setPatient(p);

      const h = await doctorApi.getPatientHistory(id);
      setHistory(h);
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

  const name = useMemo(() => {
    const full =
      patient?.full_name ??
      patient?.name ??
      `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim();
    return full || emptyDash;
  }, [patient, emptyDash]);

  const phone = patient?.phone ?? patient?.phone_number ?? emptyDash;
  const email = patient?.email ?? patient?.mail ?? emptyDash;
  const birthDate = patient?.birth_date ?? patient?.dob ?? patient?.date_of_birth ?? null;

  const genderRaw = patient?.gender ?? patient?.sex ?? "";
  const gender =
    genderRaw === "M" || genderRaw === "MALE" || genderRaw === "male"
      ? t("doctor.patientDetail.gender.male")
      : genderRaw === "F" || genderRaw === "FEMALE" || genderRaw === "female"
      ? t("doctor.patientDetail.gender.female")
      : (genderRaw ? String(genderRaw) : emptyDash);

  const status = patient?.status ?? patient?.client_status ?? patient?.tag ?? emptyDash;
  const debt = patient?.debt ?? patient?.balance_due ?? patient?.due ?? 0;
  const discount = patient?.discount ?? patient?.discount_percent ?? 0;
  const description = patient?.description ?? patient?.comment ?? patient?.notes ?? "";

  const visits = useMemo(() => normalizeList(history), [history]);

  return (
    <div className="dpd-page">
      <div className="dpd-top">
        <div className="dpd-breadcrumbs">
          <Link className="dpd-back" to="/doctor/patients">
            ← {t("doctor.patientDetail.backToPatients")}
          </Link>
          <span className="dpd-sep">/</span>
          <span>{t("doctor.patientDetail.breadcrumbEdit")}</span>
        </div>

        <div className="dpd-header">
          <div className="dpd-avatar">{initialsFromName(name, emptyDash)}</div>

          <div className="dpd-headText">
            <div className="dpd-title">{name}</div>
            <div className="dpd-sub">{phone}</div>
          </div>

          <div className="dpd-headRight">
            <div className="dpd-pill">
              <span className="dpd-pillLabel">ID</span>
              <span className="dpd-pillValue">#{id}</span>
            </div>
          </div>
        </div>

        <div className="dpd-tabs">
          <button
            className={`dpd-tab ${tab === "profile" ? "is-active" : ""}`}
            onClick={() => setTab("profile")}
            type="button"
          >
            {t("doctor.patientDetail.tabs.profile")}
          </button>
          <button
            className={`dpd-tab ${tab === "history" ? "is-active" : ""}`}
            onClick={() => setTab("history")}
            type="button"
          >
            {t("doctor.patientDetail.tabs.history")}
          </button>
        </div>
      </div>

      {loading && <div className="dpd-loading">{t("common.loading")}</div>}

      {err && (
        <div className="dpd-error">
          <div className="dpd-errorTitle">{t("doctor.patientDetail.errorTitle")}</div>
          <div className="dpd-errorBody">
            {typeof err === "string" ? err : JSON.stringify(err)}
          </div>
        </div>
      )}

      {!loading && !err && (
        <div className="dpd-content">
          {tab === "profile" && (
            <div className="dpd-card">
              <div className="dpd-cardTitle">{t("doctor.patientDetail.sections.client")}</div>

              <div className="dpd-grid">
                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.fullName")}</div>
                  <div className="dpd-value">{name}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.phone")}</div>
                  <div className="dpd-value">{phone}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.email")}</div>
                  <div className="dpd-value">{email}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.birthDate")}</div>
                  <div className="dpd-value">{fmtDate(birthDate, emptyDash)}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.gender")}</div>
                  <div className="dpd-value">{gender}</div>
                </div>
              </div>

              <div className="dpd-divider" />

              <div className="dpd-cardTitle">{t("doctor.patientDetail.sections.clientStatus")}</div>

              <div className="dpd-grid dpd-grid4">
                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.status")}</div>
                  <div className="dpd-value">{String(status ?? emptyDash)}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.debt")}</div>
                  <div className="dpd-value">{String(debt ?? 0)}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">{t("doctor.patientDetail.fields.discount")}</div>
                  <div className="dpd-value">{String(discount ?? 0)}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">ID</div>
                  <div className="dpd-value">#{id}</div>
                </div>
              </div>

              <div className="dpd-divider" />

              <div className="dpd-cardTitle">{t("doctor.patientDetail.sections.additional")}</div>
              <div className="dpd-textBox">
                {description?.trim() ? description : emptyDash}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="dpd-card">
              <div className="dpd-cardTitle">{t("doctor.patientDetail.sections.history")}</div>

              {visits.length === 0 ? (
                <div className="dpd-empty">{t("doctor.patientDetail.emptyHistory")}</div>
              ) : (
                <div className="dpd-tableWrap">
                  <table className="dpd-table">
                    <thead>
                      <tr>
                        <th>{t("doctor.patientDetail.table.id")}</th>
                        <th>{t("doctor.patientDetail.table.date")}</th>
                        <th>{t("doctor.patientDetail.table.doctor")}</th>
                        <th>{t("doctor.patientDetail.table.service")}</th>
                        <th>{t("doctor.patientDetail.table.room")}</th>
                        <th>{t("doctor.patientDetail.table.status")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((v) => {
                        const vid = v?.id ?? v?.appointment_id ?? emptyDash;
                        const dt = v?.start_at ?? v?.start ?? v?.created_at ?? v?.date ?? null;

                        const doctor =
                          v?.doctor_name ??
                          v?.doctor?.full_name ??
                          v?.doctor?.doctor_profile?.full_name ??
                          (v?.doctor ? t("doctor.patientDetail.fallback.doctor", { id: v.doctor }) : emptyDash);

                        const service =
                          v?.service_name ??
                          v?.service?.name ??
                          v?.service?.name_ru ??
                          v?.service?.name_en ??
                          (v?.service ? t("doctor.patientDetail.fallback.service", { id: v.service }) : emptyDash);

                        const room =
                          v?.room?.name ??
                          (v?.room ? t("doctor.patientDetail.fallback.room", { id: v.room }) : emptyDash);

                        const st = v?.status ?? emptyDash;

                        return (
                          <tr key={`${vid}-${dt ?? ""}`}>
                            <td className="dpd-mono">{vid}</td>
                            <td className="dpd-mono">{fmtDateTime(dt, emptyDash)}</td>
                            <td>{doctor}</td>
                            <td>{service}</td>
                            <td>{room}</td>
                            <td>
                              <span className={`dpd-status dpd-status--${String(st).toLowerCase()}`}>
                                {st}
                              </span>
                            </td>
                            <td className="dpd-actions">
                              {vid !== emptyDash ? (
                                <Link className="dpd-linkBtn" to={`/doctor/appointments/${vid}`}>
                                  {t("doctor.patientDetail.actions.open")}
                                </Link>
                              ) : (
                                emptyDash
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
