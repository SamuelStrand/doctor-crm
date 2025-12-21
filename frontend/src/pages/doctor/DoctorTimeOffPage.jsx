import React, { useEffect, useMemo, useState } from "react";
import { doctorApi } from "../../api/doctorApi";
import "../../styles/DoctorTimeOffPage.css";

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

function fmtDT(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
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
      const data = await doctorApi.listTimeOff({
        page_size: 200,
        ordering: "-start_at",
      });
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const total = items.length;

  const quick = useMemo(() => {
    const now = new Date();
    const next = [...items]
      .filter((x) => x?.start_at && new Date(x.start_at) >= now)
      .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))[0];
    return next || null;
  }, [items]);

  return (
    <div className="dto-page">
      <div className="dto-top">
        <div className="dto-kicker">Doctor</div>
        <div className="dto-titleRow">
          <h1 className="dto-title">Time-off</h1>

          <div className="dto-right">
            <div className="dto-pill">Total: {total}</div>
          </div>
        </div>

        {quick && (
          <div className="dto-hint">
            <span className="dto-hintLabel">Next:</span>{" "}
            <b>{fmtDT(quick.start_at)}</b> — <b>{fmtDT(quick.end_at)}</b>
            {quick.reason ? (
              <>
                {" "}
                · <span className="dto-muted">{quick.reason}</span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {errText && (
        <div className="dto-error">
          <div className="dto-errorTitle">Error</div>
          <div className="dto-errorBody">{errText}</div>
        </div>
      )}

      <div className="dto-grid">
        {/* Form card */}
        <div className="dto-card">
          <div className="dto-cardHead">
            <div className="dto-cardTitle">
              {editingId ? `Edit interval #${editingId}` : "Add interval"}
            </div>
            {editingId && (
              <button className="dto-btn dto-btnGhost" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={submit} className="dto-form">
            <div className="dto-field">
              <div className="dto-label">Start</div>
              <input
                className="dto-input"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>

            <div className="dto-field">
              <div className="dto-label">End</div>
              <input
                className="dto-input"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>

            <div className="dto-field">
              <div className="dto-label">Reason</div>
              <input
                className="dto-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
              />
            </div>

            <div className="dto-actions">
              <button className="dto-btn dto-btnPrimary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save" : "Create"}
              </button>
              <button
                className="dto-btn dto-btnGhost"
                type="button"
                onClick={() => {
                  resetForm();
                  setErrRaw(null);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* List card */}
        <div className="dto-card">
          <div className="dto-cardHead">
            <div className="dto-cardTitle">Intervals</div>
            <button className="dto-btn dto-btnGhost" type="button" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading && <div className="dto-loading">Loading…</div>}

          {!loading && items.length === 0 && (
            <div className="dto-empty">No time-off yet</div>
          )}

          {!loading && items.length > 0 && (
            <div className="dto-tableWrap">
              <table className="dto-table">
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
                      <td className="dto-mono">{fmtDT(x.start_at)}</td>
                      <td className="dto-mono">{fmtDT(x.end_at)}</td>
                      <td className="dto-reason">{x.reason ?? "—"}</td>
                      <td className="dto-rowActions">
                        <button className="dto-chip" onClick={() => onEdit(x)}>
                          Edit
                        </button>
                        <button className="dto-chip dto-chipDanger" onClick={() => onDelete(x.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
