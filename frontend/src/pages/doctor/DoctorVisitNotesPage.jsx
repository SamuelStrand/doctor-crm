import React, { useEffect, useMemo, useState } from "react";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/DoctorVisitNotesPage.css";

export default function DoctorVisitNotesPage() {
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
      setErr({ appointment: ["Enter valid Appointment ID"] });
      return;
    }
    if (!noteText.trim()) {
      setErr({ note_text: ["This field is required."] });
      return;
    }

    const patientFromAppointment = appointmentInfo?.patient ?? appointmentInfo?.patient_id ?? null;
    if (!patientFromAppointment) {
      setErr({
        patient: ["Selected appointment has no patient. Pick an appointment that has a patient."],
      });
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
    (appointmentInfo?.patient ? `Patient #${appointmentInfo.patient}` : null);

  const canNext = items.length > 0 && page * items.length < count; // грубо, но лучше чем всегда разрешать
  const canPrev = page > 1;

  return (
    <div className="vnPage">
      <div className="vnTop">
        <div className="vnBreadcrumb">Doctor</div>

        <div className="vnHeaderRow">
          <h1 className="vnTitle">Visit notes</h1>
          <div className="vnPill">Total: {count}</div>
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
          <div className="vnCardTitle">Create note</div>

          <form onSubmit={create} className="vnForm">
            <div className="vnField">
              <label className="vnLabel">Appointment ID</label>
              <input
                className="vnInput"
                value={appointment}
                onChange={(e) => setAppointment(e.target.value)}
                placeholder="например 21"
                inputMode="numeric"
              />
              
            </div>

            {appointmentIdNum && (
              <div className="vnInfo">
                <div className="vnInfoRow">
                  <span className="vnInfoK">Appointment</span>
                  <span className="vnInfoV">#{appointmentIdNum}</span>
                </div>
                <div className="vnInfoRow">
                  <span className="vnInfoK">Patient</span>
                  <span className="vnInfoV">{patientLabel ?? "—"}</span>
                </div>
              </div>
            )}

            <div className="vnField">
              <label className="vnLabel">Note text</label>
              <textarea
                className="vnTextarea"
                rows={5}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Напиши заметку…"
              />
            </div>

            <div className="vnActions">
              <button className="vnBtnPrimary" type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create note"}
              </button>
              <button className="vnBtnGhost" type="button" onClick={reset} disabled={creating}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: table */}
        <div className="vnCard vnCardWide">
          <div className="vnCardTitle">Notes list</div>

          {loading && <div className="vnLoading">Loading…</div>}

          {!loading && items.length === 0 && <div className="vnEmpty">No notes</div>}

          {!loading && items.length > 0 && (
            <div className="vnTableWrap">
              <table className="vnTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Appointment</th>
                    <th>Patient</th>
                    <th>Created</th>
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
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="vnPager">
            <button className="vnBtnGhostSm" disabled={!canPrev || loading} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <div className="vnPagerMid">
              <span className="vnPagerBadge">{page}</span>
            </div>
            <button className="vnBtnGhostSm" disabled={!canNext || loading} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
