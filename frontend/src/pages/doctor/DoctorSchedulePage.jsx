import React, { useEffect, useMemo, useState } from "react";
import { doctorApi } from "../../api/doctorApi";
import "../../styles/DoctorSchedulePage.css";

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

function parseHHMMToMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = String(hhmm).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmtHM(hhmm) {
  return String(hhmm || "").slice(0, 5);
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

  const totalIntervals = items.length;

  const resetForm = () => {
    setWeekday(0);
    setStartTime("09:00");
    setEndTime("18:00");
    setSlotMinutes(30);
    setEditingId(null);
  };

  const validate = () => {
    const st = parseHHMMToMinutes(startTime);
    const en = parseHHMMToMinutes(endTime);
    if (en <= st) return "End time must be later than start time.";
    if (Number(slotMinutes) < 5) return "Slot minutes must be >= 5.";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr({ detail: v });
      return;
    }

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
    <div className="dsPage">
      <div className="dsTop">
        <div className="dsBreadcrumb">Doctor</div>

        <div className="dsHeaderRow">
          <h1 className="dsTitle">Schedule</h1>
          <div className="dsPill">Total: {totalIntervals}</div>
        </div>

        {err && (
          <div className="dsError">
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="dsLayout">
        {/* LEFT: form card */}
        <div className="dsCard">
          <div className="dsCardTitle">{editingId ? "Edit interval" : "Add interval"}</div>

          <form onSubmit={submit} className="dsForm">
            <div className="dsField">
              <label className="dsLabel">Weekday</label>
              <select className="dsSelect" value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
                {WEEKDAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="dsGrid2">
              <div className="dsField">
                <label className="dsLabel">Start</label>
                <input className="dsInput" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="dsField">
                <label className="dsLabel">End</label>
                <input className="dsInput" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="dsField">
              <label className="dsLabel">Slot minutes</label>
              <input
                className="dsInput"
                type="number"
                min="5"
                step="5"
                value={slotMinutes}
                onChange={(e) => setSlotMinutes(e.target.value)}
                placeholder="30"
              />
              <div className="dsHint">Example: 10 / 15 / 20 / 30</div>
            </div>

            <div className="dsActions">
              <button className="dsBtnPrimary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save" : "Create"}
              </button>
              {editingId ? (
                <button className="dsBtnGhost" type="button" onClick={resetForm} disabled={saving}>
                  Cancel
                </button>
              ) : (
                <button className="dsBtnGhost" type="button" onClick={resetForm} disabled={saving}>
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: table card */}
        <div className="dsCard dsCardWide">
          <div className="dsCardTitle">Intervals</div>

          {loading && <div className="dsLoading">Loading…</div>}

          {!loading && items.length === 0 && <div className="dsEmpty">No schedule yet</div>}

          {!loading && items.length > 0 && (
            <div className="dsTableWrap">
              <table className="dsTable">
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
                    list.map((s) => {
                      const isEditing = editingId === s.id;
                      return (
                        <tr key={s.id} className={isEditing ? "isEditing" : ""}>
                          <td>
                            <span className="dsDayPill">{weekdayLabel(w)}</span>
                          </td>
                          <td>{fmtHM(s.start_time)}</td>
                          <td>{fmtHM(s.end_time)}</td>
                          <td>
                            <span className="dsSlotPill">{s.slot_minutes} min</span>
                          </td>
                          <td className="dsRowActions">
                            
                            <button className="dsBtnSmallDanger" onClick={() => onDelete(s.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
