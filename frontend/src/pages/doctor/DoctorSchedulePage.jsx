import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { doctorApi } from "../../api/doctorApi";
import "../../styles/DoctorSchedulePage.css";

function parseHHMMToMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = String(hhmm).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmtHM(hhmm) {
  return String(hhmm || "").slice(0, 5);
}

export default function DoctorSchedulePage() {
  const { t } = useTranslation();

  const WEEKDAYS = useMemo(
    () => [
      { value: 0, label: t("doctor.schedule.weekdays.mon") },
      { value: 1, label: t("doctor.schedule.weekdays.tue") },
      { value: 2, label: t("doctor.schedule.weekdays.wed") },
      { value: 3, label: t("doctor.schedule.weekdays.thu") },
      { value: 4, label: t("doctor.schedule.weekdays.fri") },
      { value: 5, label: t("doctor.schedule.weekdays.sat") },
      { value: 6, label: t("doctor.schedule.weekdays.sun") },
    ],
    [t]
  );

  const weekdayLabel = (v) =>
    WEEKDAYS.find((x) => x.value === Number(v))?.label ?? String(v);

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
    if (en <= st) return t("doctor.schedule.validation.endLater");
    if (Number(slotMinutes) < 5) return t("doctor.schedule.validation.slotMin");
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

  const onDelete = async (id) => {
    if (!confirm(t("doctor.schedule.confirmDelete"))) return;
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
        <div className="dsBreadcrumb">{t("doctor.schedule.breadcrumb")}</div>

        <div className="dsHeaderRow">
          <h1 className="dsTitle">{t("doctor.schedule.title")}</h1>
          <div className="dsPill">
            {t("doctor.schedule.total")}: {totalIntervals}
          </div>
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
          <div className="dsCardTitle">
            {editingId ? t("doctor.schedule.form.editTitle") : t("doctor.schedule.form.addTitle")}
          </div>

          <form onSubmit={submit} className="dsForm">
            <div className="dsField">
              <label className="dsLabel">{t("doctor.schedule.form.weekday")}</label>
              <select
                className="dsSelect"
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
              >
                {WEEKDAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="dsGrid2">
              <div className="dsField">
                <label className="dsLabel">{t("doctor.schedule.form.start")}</label>
                <input
                  className="dsInput"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="dsField">
                <label className="dsLabel">{t("doctor.schedule.form.end")}</label>
                <input
                  className="dsInput"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="dsField">
              <label className="dsLabel">{t("doctor.schedule.form.slotMinutes")}</label>
              <input
                className="dsInput"
                type="number"
                min="5"
                step="5"
                value={slotMinutes}
                onChange={(e) => setSlotMinutes(e.target.value)}
                placeholder="30"
              />
              <div className="dsHint">{t("doctor.schedule.form.slotHint")}</div>
            </div>

            <div className="dsActions">
              <button className="dsBtnPrimary" type="submit" disabled={saving}>
                {saving
                  ? t("doctor.schedule.form.saving")
                  : editingId
                  ? t("doctor.schedule.form.save")
                  : t("doctor.schedule.form.create")}
              </button>

              <button
                className="dsBtnGhost"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                {editingId ? t("doctor.schedule.form.cancel") : t("doctor.schedule.form.reset")}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: table card */}
        <div className="dsCard dsCardWide">
          <div className="dsCardTitle">{t("doctor.schedule.table.title")}</div>

          {loading && <div className="dsLoading">{t("common.loading")}</div>}

          {!loading && items.length === 0 && (
            <div className="dsEmpty">{t("doctor.schedule.empty")}</div>
          )}

          {!loading && items.length > 0 && (
            <div className="dsTableWrap">
              <table className="dsTable">
                <thead>
                  <tr>
                    <th>{t("doctor.schedule.table.weekday")}</th>
                    <th>{t("doctor.schedule.table.start")}</th>
                    <th>{t("doctor.schedule.table.end")}</th>
                    <th>{t("doctor.schedule.table.slot")}</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {Array.from(byDay.entries()).flatMap(([w, list]) =>
                    list.map((s) => (
                      <tr key={s.id} className={editingId === s.id ? "isEditing" : ""}>
                        <td>
                          <span className="dsDayPill">{weekdayLabel(w)}</span>
                        </td>
                        <td>{fmtHM(s.start_time)}</td>
                        <td>{fmtHM(s.end_time)}</td>
                        <td>
                          <span className="dsSlotPill">
                            {s.slot_minutes} {t("doctor.schedule.table.min")}
                          </span>
                        </td>
                        <td className="dsRowActions">
                          <button
                            className="dsBtnSmallDanger"
                            onClick={() => onDelete(s.id)}
                            type="button"
                          >
                            {t("doctor.schedule.actions.delete")}
                          </button>
                        </td>
                      </tr>
                    ))
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
