import React, { useEffect, useMemo, useState } from "react";
import { doctorApi } from "../../api/doctorApi";

const WEEKDAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

function weekdayLabel(v) {
  return WEEKDAYS.find((x) => x.value === Number(v))?.label ?? String(v);
}

export default function DoctorSchedulePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [weekday, setWeekday] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [slotMinutes, setSlotMinutes] = useState(30);

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await doctorApi.listSchedule({ page_size: 200 });
      const list = data?.results ?? data ?? [];
      setItems(list);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byDay = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < 7; i++) map.set(i, []);
    for (const s of items) {
      const w = Number(s.weekday);
      if (!map.has(w)) map.set(w, []);
      map.get(w).push(s);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
      map.set(k, list);
    }
    return map;
  }, [items]);

  const resetForm = () => {
    setWeekday(0);
    setStartTime("09:00");
    setEndTime("18:00");
    setSlotMinutes(30);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    const payload = {
      weekday: Number(weekday),
      start_time: startTime,
      end_time: endTime,
      slot_minutes: Number(slotMinutes),
    };

    try {
      if (editingId) {
        await doctorApi.patchSchedule(editingId, payload);
      } else {
        await doctorApi.createSchedule(payload);
      }
      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row) => {
    setEditingId(row.id);
    setWeekday(Number(row.weekday));
    setStartTime(String(row.start_time).slice(0, 5));
    setEndTime(String(row.end_time).slice(0, 5));
    setSlotMinutes(Number(row.slot_minutes ?? 30));
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this schedule interval?")) return;
    setErr(null);
    try {
      await doctorApi.deleteSchedule(id);
      await load();
      if (editingId === id) resetForm();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Doctor • Schedule</h2>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 520,
          padding: 12,
          border: "1px solid #eee",
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 700 }}>{editingId ? "Edit interval" : "Add interval"}</div>

        <label>
          Weekday:
          <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
            {WEEKDAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start time:
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>

        <label>
          End time:
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>

        <label>
          Slot minutes:
          <input
            type="number"
            min="5"
            step="5"
            value={slotMinutes}
            onChange={(e) => setSlotMinutes(e.target.value)}
          />
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

      {err && (
        <pre style={{ background: "#eee", padding: 12, marginBottom: 12 }}>
          {JSON.stringify(err, null, 2)}
        </pre>
      )}
      {loading && <p>Loading…</p>}

      {!loading && items.length === 0 && <p>No schedule yet</p>}

      {!loading && items.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Weekday</th>
              <th>Start</th>
              <th>End</th>
              <th>Slot</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Array.from(byDay.entries()).flatMap(([w, list]) =>
              list.map((s) => (
                <tr key={s.id}>
                  <td>{weekdayLabel(w)}</td>
                  <td>{String(s.start_time).slice(0, 5)}</td>
                  <td>{String(s.end_time).slice(0, 5)}</td>
                  <td>{s.slot_minutes}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button onClick={() => onEdit(s)} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button onClick={() => onDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
