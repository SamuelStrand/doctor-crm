import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { useTranslation } from "react-i18next";
import "../../styles/DoctorVisitNoteDetailPage.css";

// ⚠️ если бэк ждёт другое поле — поменяй
const FIELD_TEXT = "note_text"; // иногда "content" / "note"

function fileNameFromAttachment(a) {
  return (
    a?.filename ||
    a?.file_name ||
    a?.file ||
    (a?.id ? `attachment-${a.id}` : "attachment")
  );
}
function fileUrlFromAttachment(a) {
  return a?.file_url || a?.url || a?.file || a?.download_url || "#";
}

export default function DoctorVisitNoteDetailPage() {
  const { t } = useTranslation();

  const { id } = useParams();
  const nav = useNavigate();

  const [note, setNote] = useState(null);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingNote, setDeletingNote] = useState(false);
  const [deletingAttId, setDeletingAttId] = useState(null);

  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const n = await doctorApi.getVisitNote(id);
      setNote(n);
      setText(n?.[FIELD_TEXT] ?? "");

      // attachments могут быть пагинированными
      const att = await doctorApi.listAttachments(id);
      const list = att?.results ?? att ?? [];
      setAttachments(Array.isArray(list) ? list : []);
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

  const save = async () => {
    setErr(null);
    setSaving(true);
    try {
      await doctorApi.patchVisitNote(id, { [FIELD_TEXT]: text });
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setSaving(false);
    }
  };

  const upload = async () => {
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      await doctorApi.uploadAttachment(id, file);
      setFile(null);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (attachmentId) => {
    if (!confirm(t("doctor.visitNoteDetail.confirm.deleteAttachment"))) return;
    setErr(null);
    setDeletingAttId(attachmentId);
    try {
      await doctorApi.deleteAttachment(id, attachmentId);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setDeletingAttId(null);
    }
  };

  const removeNote = async () => {
    if (!confirm(t("doctor.visitNoteDetail.confirm.deleteNote"))) return;
    setErr(null);
    setDeletingNote(true);
    try {
      await doctorApi.deleteVisitNote(id);
      nav("/doctor/visit-notes");
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setDeletingNote(false);
    }
  };

  const appointmentLabel =
    note?.appointment?.id ?? note?.appointment_id ?? note?.appointment ?? "-";

  const patientLabel =
    note?.patient?.full_name ??
    note?.patient_name ??
    (note?.patient ? `${t("doctor.visitNoteDetail.patientPrefix")} #${note.patient}` : "-");

  return (
    <div className="vndPage">
      <div className="vndTop">
        <Link className="vndBack" to="/doctor/visit-notes">
          ← {t("doctor.visitNoteDetail.back")}
        </Link>

        <div className="vndHeaderRow">
          <div>
            <div className="vndBreadcrumb">{t("doctor.visitNoteDetail.breadcrumb")}</div>
            <h1 className="vndTitle">
              {t("doctor.visitNoteDetail.title", { id })}
            </h1>
          </div>

          <div className="vndHeaderActions">
            <button
              className="vndBtnPrimary"
              onClick={save}
              disabled={saving || loading || !note}
              type="button"
            >
              {saving ? t("doctor.visitNoteDetail.actions.saving") : t("doctor.visitNoteDetail.actions.save")}
            </button>

            <button
              className="vndBtnDanger"
              onClick={removeNote}
              disabled={deletingNote || loading || !note}
              type="button"
            >
              {deletingNote
                ? t("doctor.visitNoteDetail.actions.deleting")
                : t("doctor.visitNoteDetail.actions.deleteNote")}
            </button>
          </div>
        </div>

        {err && (
          <div className="vndError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      {loading && <div className="vndLoading">{t("common.loading")}</div>}

      {note && !loading && (
        <div className="vndGrid">
          {/* LEFT: note */}
          <div className="vndCard">
            <div className="vndCardTitle">{t("doctor.visitNoteDetail.details.title")}</div>

            <div className="vndMeta">
              <div className="vndMetaRow">
                <span className="vndMetaK">{t("doctor.visitNoteDetail.details.appointment")}</span>
                <span className="vndMetaV">#{appointmentLabel}</span>
              </div>
              <div className="vndMetaRow">
                <span className="vndMetaK">{t("doctor.visitNoteDetail.details.patient")}</span>
                <span className="vndMetaV">{patientLabel}</span>
              </div>
              <div className="vndMetaRow">
                <span className="vndMetaK">{t("doctor.visitNoteDetail.details.created")}</span>
                <span className="vndMetaV">{note?.created_at ?? t("common.emptyDash")}</span>
              </div>
              <div className="vndMetaRow">
                <span className="vndMetaK">{t("doctor.visitNoteDetail.details.updated")}</span>
                <span className="vndMetaV">{note?.updated_at ?? t("common.emptyDash")}</span>
              </div>
            </div>

            <div className="vndField">
              <label className="vndLabel">{t("doctor.visitNoteDetail.fields.noteText")}</label>
              <textarea
                className="vndTextarea"
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("doctor.visitNoteDetail.placeholders.noteText")}
              />
            </div>

            <div className="vndBottomActions">
              <button className="vndBtnPrimary" onClick={save} disabled={saving} type="button">
                {saving ? t("doctor.visitNoteDetail.actions.saving") : t("doctor.visitNoteDetail.actions.save")}
              </button>

              <button
                className="vndBtnGhost"
                onClick={() => setText(note?.[FIELD_TEXT] ?? "")}
                disabled={saving}
                type="button"
              >
                {t("doctor.visitNoteDetail.actions.revert")}
              </button>
            </div>
          </div>

          {/* RIGHT: attachments */}
          <div className="vndCard">
            <div className="vndCardTitle">{t("doctor.visitNoteDetail.attachments.title")}</div>

            <div className="vndUploadRow">
              <label className="vndFilePick">
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <span>{file ? file.name : t("doctor.visitNoteDetail.attachments.chooseFile")}</span>
              </label>

              <button
                className="vndBtnPrimary"
                onClick={upload}
                disabled={!file || uploading}
                type="button"
              >
                {uploading
                  ? t("doctor.visitNoteDetail.attachments.uploading")
                  : t("doctor.visitNoteDetail.attachments.upload")}
              </button>
            </div>

            {attachments.length === 0 ? (
              <div className="vndEmpty">{t("doctor.visitNoteDetail.attachments.empty")}</div>
            ) : (
              <div className="vndAttList">
                {attachments.map((a) => (
                  <div key={a.id} className="vndAttItem">
                    <div className="vndAttMain">
                      <div className="vndAttName">{fileNameFromAttachment(a)}</div>
                      <div className="vndAttSub">
                        {t("doctor.visitNoteDetail.attachments.id")}:{" "}
                        <span className="vndMono">{a.id}</span>
                        {a?.created_at ? <> · {a.created_at}</> : null}
                      </div>
                    </div>

                    <div className="vndAttActions">
                      <a
                        className="vndLinkBtn"
                        href={fileUrlFromAttachment(a)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("doctor.visitNoteDetail.actions.open")}
                      </a>

                      <button
                        className="vndBtnGhostSm"
                        onClick={() => removeAttachment(a.id)}
                        disabled={deletingAttId === a.id}
                        type="button"
                      >
                        {deletingAttId === a.id
                          ? t("doctor.visitNoteDetail.actions.deleting")
                          : t("doctor.visitNoteDetail.actions.delete")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
