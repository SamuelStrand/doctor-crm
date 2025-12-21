import React, { useEffect, useMemo, useState } from "react";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../styles/DoctorVisitNotesPage.css";

export default function DoctorVisitNotesPage() {
  const { t } = useTranslation();

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

  // 1) Инфа по appointment (чтобы показать patient)
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

  // 2) Список заметок (опционально фильтр по appointment)
  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await doctorApi.listVisitNotes({
        page,
        appointment: appointmentIdNum ?? undefined,
      });

      const { items, count } = unwrapPaginated(data);
      setItems(items);
      setCount(count);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // если меняем appointment — возвращаемся на первую страницу
  }, [appointmentIdNum]);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page, appointmentIdNum]);

  const reset = () => {
    setAppointment("");
    setNoteText("");
    setAppointmentInfo(null);
    setErr(null);
    setPage(1);
  };

  // 3) Создание заметки
  const create = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!appointmentIdNum) {
      setErr({ appointment: [t("doctor.visitNotes.errors.invalidAppointment")] });
      return;
    }
    if (!noteText.trim()) {
      setErr({ note_text: [t("doctor.visitNotes.errors.noteRequired")] });
      return;
    }

    const patientFromAppointment =
      appointmentInfo?.patient ?? appointmentInfo?.patient_id ?? null;

    if (!patientFromAppointment) {
      setErr({ patient: [t("doctor.visitNotes.errors.noPatientOnAppointment")] });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        appointment: appointmentIdNum,
        note_text: noteText.trim(),
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
    (appointmentInfo?.patient
      ? `${t("doctor.visitNotes.patientPrefix")} #${appointmentInfo.patient}`
      : null);

  const canNext = items.length > 0 && page * items.length < count;
  const canPrev = page > 1;

  return (
    <div className="vnPage">
      <div className="vnTop">
        <div className="vnBreadcrumb">{t("doctor.visitNotes.breadcrumb")}</div>

        <div className="vnHeaderRow">
          <h1 className="vnTitle">{t("doctor.visitNotes.title")}</h1>
          <div className="vnPill">
            {t("doctor.visitNotes.total")}: {count}
          </div>
        </div>

        {err && (
          <div className="vnError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="vnLayout">
        {/* LEFT: create form */}
        <div className="vnCard">
          <div className="vnCardTitle">{t("doctor.visitNotes.create.title")}</div>

          <form onSubmit={create} className="vnForm">
            <div className="vnField">
              <label className="vnLabel">{t("doctor.visitNotes.fields.appointmentId")}</label>
              <input
                className="vnInput"
                value={appointment}
                onChange={(e) => setAppointment(e.target.value)}
                placeholder={t("doctor.visitNotes.placeholders.appointmentId")}
                inputMode="numeric"
              />
            </div>

            {appointmentIdNum && (
              <div className="vnInfo">
                <div className="vnInfoRow">
                  <span className="vnInfoK">{t("doctor.visitNotes.info.appointment")}</span>
                  <span className="vnInfoV">#{appointmentIdNum}</span>
                </div>
                <div className="vnInfoRow">
                  <span className="vnInfoK">{t("doctor.visitNotes.info.patient")}</span>
                  <span className="vnInfoV">
                    {patientLabel ?? t("common.emptyDash")}
                  </span>
                </div>
              </div>
            )}

            <div className="vnField">
              <label className="vnLabel">{t("doctor.visitNotes.fields.noteText")}</label>
              <textarea
                className="vnTextarea"
                rows={5}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t("doctor.visitNotes.placeholders.noteText")}
              />
            </div>

            <div className="vnActions">
              <button className="vnBtnPrimary" type="submit" disabled={creating}>
                {creating
                  ? t("doctor.visitNotes.actions.creating")
                  : t("doctor.visitNotes.actions.create")}
              </button>

              <button
                className="vnBtnGhost"
                type="button"
                onClick={reset}
                disabled={creating}
              >
                {t("doctor.visitNotes.actions.reset")}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: table */}
        <div className="vnCard vnCardWide">
          <div className="vnCardTitle">{t("doctor.visitNotes.list.title")}</div>

          {loading && <div className="vnLoading">{t("common.loading")}</div>}

          {!loading && items.length === 0 && (
            <div className="vnEmpty">{t("doctor.visitNotes.list.empty")}</div>
          )}

          {!loading && items.length > 0 && (
            <div className="vnTableWrap">
              <table className="vnTable">
                <thead>
                  <tr>
                    <th>{t("doctor.visitNotes.table.id")}</th>
                    <th>{t("doctor.visitNotes.table.appointment")}</th>
                    <th>{t("doctor.visitNotes.table.patient")}</th>
                    <th>{t("doctor.visitNotes.table.created")}</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((n) => (
                    <tr key={n.id}>
                      <td className="vnMono">{n.id}</td>
                      <td className="vnMono">{n.appointment ?? "-"}</td>
                      <td>{n.patient_name ?? n.patient?.full_name ?? n.patient ?? "-"}</td>
                      <td className="vnDim">{n.created_at ?? "-"}</td>
                      <td className="vnRowActions">
                        <Link className="vnLinkBtn" to={`/doctor/visit-notes/${n.id}`}>
                          {t("doctor.visitNotes.actions.open")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="vnPager">
            <button
              className="vnBtnGhostSm"
              disabled={!canPrev || loading}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              {t("doctor.visitNotes.pager.prev")}
            </button>

            <div className="vnPagerMid">
              <span className="vnPagerBadge">{page}</span>
            </div>

            <button
              className="vnBtnGhostSm"
              disabled={!canNext || loading}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              {t("doctor.visitNotes.pager.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
