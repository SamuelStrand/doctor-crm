import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";

// ⚠️ если бэк ждёт другое поле — поменяй
const FIELD_TEXT = "note_text"; // иногда "content" / "note"

export default function DoctorVisitNoteDetailPage() {
  const { id } = useParams();

  const [note, setNote] = useState(null);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const n = await doctorApi.getVisitNote(id);
      setNote(n);
      setText(n[FIELD_TEXT] ?? "");
      const att = await doctorApi.listAttachments(id);
      setAttachments(att.results ?? att); // вдруг тоже пагинируется
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const save = async () => {
    setErr(null);
    try {
      await doctorApi.patchVisitNote(id, { [FIELD_TEXT]: text });
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  const upload = async () => {
    if (!file) return;
    setErr(null);
    try {
      await doctorApi.uploadAttachment(id, file);
      setFile(null);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  const removeAttachment = async (attachmentId) => {
    setErr(null);
    try {
      await doctorApi.deleteAttachment(id, attachmentId);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  const removeNote = async () => {
    if (!confirm("Delete this note?")) return;
    setErr(null);
    try {
      await doctorApi.deleteVisitNote(id);
      window.location.href = "/doctor/visit-notes";
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/doctor/visit-notes">← Back</Link>
        <h2 style={{ margin: 0 }}>Visit note #{id}</h2>
      </div>

      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}
      {loading && <p>Loading…</p>}

      {note && (
        <>
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <b>Appointment:</b> {note.appointment?.id ?? note.appointment ?? "-"}{" "}
              <b style={{ marginLeft: 12 }}>Patient:</b> {note.patient?.full_name ?? note.patient ?? "-"}
            </div>

            <textarea
              rows={8}
              style={{ width: "100%" }}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={save}>Save</button>
              <button onClick={removeNote}>Delete note</button>
            </div>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <h3>Attachments</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <button onClick={upload} disabled={!file}>Upload</button>
          </div>

          <ul>
            {attachments.map((a) => (
              <li key={a.id} style={{ marginBottom: 6 }}>
                <a href={a.file_url ?? a.url ?? "#"} target="_blank" rel="noreferrer">
                  {a.filename ?? a.file ?? `attachment-${a.id}`}
                </a>{" "}
                <button onClick={() => removeAttachment(a.id)}>Delete</button>
              </li>
            ))}
            {attachments.length === 0 && <li>No attachments</li>}
          </ul>

          <details style={{ marginTop: 12 }}>
            <summary>Raw JSON</summary>
            <pre style={{ background: "#f6f6f6", padding: 12 }}>{JSON.stringify(note, null, 2)}</pre>
          </details>
        </>
      )}
    </div>
  );
}
