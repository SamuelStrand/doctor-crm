import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import "../../styles/AdminAppointmentFormPage.css";
import { useTranslation } from "react-i18next";

function toInputDatetime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toISOFromInput(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return d.toISOString();
}

function pickName(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string" || typeof obj === "number") return String(obj);

  if (lang === "ru")
    return (
      obj.full_name ||
      obj.name_ru ||
      obj.name_en ||
      obj.name_kk ||
      obj.name ||
      obj.title ||
      obj.code ||
      ""
    );

  if (lang === "en")
    return (
      obj.full_name ||
      obj.name_en ||
      obj.name_ru ||
      obj.name_kk ||
      obj.name ||
      obj.title ||
      obj.code ||
      ""
    );

  if (lang === "kk")
    return (
      obj.full_name ||
      obj.name_kk ||
      obj.name_ru ||
      obj.name_en ||
      obj.name ||
      obj.title ||
      obj.code ||
      ""
    );

  return (
    obj.full_name ||
    obj.name_ru ||
    obj.name_en ||
    obj.name_kk ||
    obj.name ||
    obj.title ||
    obj.code ||
    ""
  );
}

function unwrapItems(resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.items)) return resp.items;
  if (Array.isArray(resp.results)) return resp.results;
  return [];
}

/** ✅ красивый label для пациента: "Full Name — #ID (phone)" */
function makePatientLabel(p, lang) {
  if (!p) return "";
  const name =
    pickName(p, lang) ||
    [p?.last_name, p?.first_name, p?.middle_name].filter(Boolean).join(" ") ||
    p?.email ||
    "";

  const idPart = p?.id != null ? `#${p.id}` : "";
  const phonePart = p?.phone ? `(${p.phone})` : "";

  // если имени нет — хотя бы id
  if (!name && idPart) return `${idPart} ${phonePart}`.trim();

  // имя первым, id рядом
  const parts = [name, idPart, phonePart].filter(Boolean);
  // сделаем "Имя — #12 (тел)"
  const [n, id, ph] = parts;
  if (n && (id || ph)) return `${n} — ${[id, ph].filter(Boolean).join(" ")}`;
  return n || "—";
}

export default function AdminAppointmentFormPage({ mode }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "ru").slice(0, 2);

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

  const title = isEdit
    ? t("admin.apptForm.titleEdit", { id })
    : t("admin.apptForm.titleNew");

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
    if (!patient) errors.push(t("admin.apptForm.validation.patientRequired"));
    if (!doctor) errors.push(t("admin.apptForm.validation.doctorRequired"));
    if (!service) errors.push(t("admin.apptForm.validation.serviceRequired"));
    if (!room) errors.push(t("admin.apptForm.validation.roomRequired"));
    if (!startAt) errors.push(t("admin.apptForm.validation.startRequired"));
    if (!endAt) errors.push(t("admin.apptForm.validation.endRequired"));

    if (startAt && endAt) {
      const s = new Date(startAt).getTime();
      const e = new Date(endAt).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e <= s) {
        errors.push(t("admin.apptForm.validation.endAfterStart"));
      }
    }
    return errors;
  }, [patient, doctor, service, room, startAt, endAt, t]);

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
          ← {t("common.back")}
        </Link>

        <div className="afHeadRow">
          <div>
            <div className="afBreadcrumb">{t("admin.appointments.breadcrumb")}</div>
            <h1 className="afTitle">{title}</h1>
            <div className="afSub">
              {t("admin.apptForm.sub")}
              {refsLoading ? ` (${t("admin.apptForm.refsLoading")})` : ""}
            </div>
          </div>

          <div className="afHeadActions">
            <button
              className="afGhost"
              type="button"
              onClick={() => nav("/admin/appointments")}
              disabled={saving}
            >
              {t("common.cancel")}
            </button>
            <button className="afPrimary" type="submit" form="apptForm" disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </div>

        {loading && <div className="afLoading">{t("common.loading")}</div>}

        {err && (
          <div className="afError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="afCard">
        <div className="afCardTitle">{t("admin.apptForm.formTitle")}</div>

        <form id="apptForm" onSubmit={save} className="afForm">
          {/* ROW 1 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.patient")} *</div>

              {canUsePatients ? (
                <select
                  className="afControl"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                >
                  <option value="">{t("admin.apptForm.select")}</option>

                  {/* ✅ теперь в списке видно и имя, и id */}
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {makePatientLabel(p, lang)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  placeholder={t("admin.apptForm.placeholders.patientId")}
                />
              )}

              {!canUsePatients && (
                <div className="afHint">{t("admin.apptForm.hints.patientsNotLoaded")}</div>
              )}
            </div>

            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.doctor")} *</div>

              {canUseDoctors ? (
                <select
                  className="afControl"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                >
                  <option value="">{t("admin.apptForm.select")}</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      #{d.id} {pickName(d?.doctor_profile, lang) || pickName(d, lang)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  placeholder={t("admin.apptForm.placeholders.doctorId")}
                />
              )}

              {!canUseDoctors && (
                <div className="afHint">{t("admin.apptForm.hints.doctorsNotLoaded")}</div>
              )}
            </div>
          </div>

          {/* ROW 2 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.service")} *</div>

              {canUseServices ? (
                <select
                  className="afControl"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">{t("admin.apptForm.select")}</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} {s.code ? `${s.code} — ` : ""}
                      {pickName(s, lang)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder={t("admin.apptForm.placeholders.serviceId")}
                />
              )}

              {!canUseServices && (
                <div className="afHint">{t("admin.apptForm.hints.servicesNotLoaded")}</div>
              )}
            </div>

            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.room")} *</div>

              {canUseRooms ? (
                <select
                  className="afControl"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                >
                  <option value="">{t("admin.apptForm.select")}</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} {pickName(r, lang)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="afControl"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder={t("admin.apptForm.placeholders.roomId")}
                />
              )}

              {!canUseRooms && (
                <div className="afHint">{t("admin.apptForm.hints.roomsNotLoaded")}</div>
              )}
            </div>
          </div>

          {/* ROW 3 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.start")} *</div>
              <input
                className="afControl"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              <div className="afHint">{t("admin.apptForm.hints.localTime")}</div>
            </div>

            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.end")} *</div>
              <input
                className="afControl"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
              <div className="afHint">{t("admin.apptForm.hints.endAfterStart")}</div>
            </div>
          </div>

          {/* ROW 4 */}
          <div className="afGrid2">
            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.reason")}</div>
              <input
                className="afControl"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("admin.apptForm.placeholders.reason")}
              />
            </div>

            <div className="afField">
              <div className="afLabel">{t("admin.apptForm.fields.comment")}</div>
              <textarea
                className="afControl afTextarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("admin.apptForm.placeholders.comment")}
              />
            </div>
          </div>

          {/* FOOTER ACTIONS (mobile friendly) */}
          <div className="afFooter">
            <button
              className="afGhost"
              type="button"
              onClick={() => nav("/admin/appointments")}
              disabled={saving}
            >
              {t("common.cancel")}
            </button>
            <button className="afPrimary" type="submit" disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
