import React, { useEffect, useState } from "react";
import { doctorApi } from "../../api/doctorApi";

function toInputDatetime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toISO(dtLocal) {
  if (!dtLocal) return null;
  return new Date(dtLocal).toISOString();
}

function prettyError(e) {
  if (!e) return null;
  if (typeof e === "string") return e;
  if (e.detail) return e.detail;
  if (e.non_field_errors?.length) return e.non_field_errors.join("\n");
  const keys = Object.keys(e);
  if (keys.length === 0) return "Unknown error";
  return keys
    .map((k) => `${k}: ${Array.isArray(e[k]) ? e[k].join(", ") : String(e[k])}`)
    .join("\n");
}

export default function DoctorTimeOffPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errRaw, setErrRaw] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErrRaw(null);
    try {
      const data = await doctorApi.listTimeOff({ page_size: 200, ordering: "-start_at" });
      const list = data?.results ?? data ?? [];
      setItems(list);
    } catch (e) {
      setErrRaw(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setStartAt("");
    setEndAt("");
    setReason("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrRaw(null);

    const payload = {
      start_at: toISO(startAt),
      end_at: toISO(endAt),
      reason,
    };

    try {
      if (editingId) {
        await doctorApi.patchTimeOff(editingId, payload);
      } else {
        await doctorApi.createTimeOff(payload);
      }
      resetForm();
      await load();
    } catch (e2) {
      setErrRaw(e2?.response?.data ?? { detail: e2.message });
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row) => {
    setEditingId(row.id);
    setStartAt(toInputDatetime(row.start_at));
    setEndAt(toInputDatetime(row.end_at));
    setReason(row.reason ?? "");
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this time-off interval?")) return;
    setErrRaw(null);
    try {
      await doctorApi.deleteTimeOff(id);
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      setErrRaw(e?.response?.data ?? { detail: e.message });
    }
  };

  const errText = prettyError(errRaw);

  return (
    <div style={{ padding: 20 }}>
      <h2>Doctor • Time-off</h2>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 560,
          padding: 12,
          border: "1px solid #eee",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 700 }}>{editingId ? "Edit interval" : "Add interval"}</div>

        <label>
          Start:
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </label>

        <label>
          End:
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </label>

        <label>
          Reason:
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save" : "Create"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {errText && (
        <pre style={{ background: "#eee", padding: 12, marginBottom: 12, whiteSpace: "pre-wrap" }}>
          {errText}
        </pre>
      )}

      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No time-off yet</p>}

      {!loading && items.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id}>
                <td>{x.start_at}</td>
                <td>{x.end_at}</td>
                <td>{x.reason ?? "-"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button onClick={() => onEdit(x)} style={{ marginRight: 8 }}>
                    Edit
                  </button>
                  <button onClick={() => onDelete(x.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
