import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import "../../styles/DoctorPatientDetailPage.css";

function initialsFromName(name) {
  const s = String(name || "").trim();
  if (!s) return "—";
  const parts = s.split(/\s+/).filter(Boolean);
  const a = (parts[0]?.[0] || "").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return (a + b) || a || "—";
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`;
}

function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()} ${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
}

function normalizeList(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (Array.isArray(x.results)) return x.results;
  if (Array.isArray(x.items)) return x.items;
  if (Array.isArray(x.visits)) return x.visits;
  if (Array.isArray(x.appointments)) return x.appointments;
  return [];
}

export default function DoctorPatientDetailPage() {
  const { id } = useParams();

  const [tab, setTab] = useState("profile"); // profile | history

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const p = await doctorApi.getPatient(id);
      setPatient(p);

      // history может быть любым форматом — пытаемся нормализовать
      const h = await doctorApi.getPatientHistory(id);
      setHistory(h);
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

  const name = useMemo(() => {
    const full =
      patient?.full_name ??
      patient?.name ??
      `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim();
    return full || "—";
  }, [patient]);

  const phone = patient?.phone ?? patient?.phone_number ?? "—";
  const email = patient?.email ?? patient?.mail ?? "—";
  const birthDate = patient?.birth_date ?? patient?.dob ?? patient?.date_of_birth ?? null;

  const genderRaw = patient?.gender ?? patient?.sex ?? "";
  const gender =
    genderRaw === "M" || genderRaw === "MALE" || genderRaw === "male" ? "Мужской" :
    genderRaw === "F" || genderRaw === "FEMALE" || genderRaw === "female" ? "Женский" :
    (genderRaw ? String(genderRaw) : "—");

  const status = patient?.status ?? patient?.client_status ?? patient?.tag ?? "—";
  const debt = patient?.debt ?? patient?.balance_due ?? patient?.due ?? 0;
  const discount = patient?.discount ?? patient?.discount_percent ?? 0;
  const description = patient?.description ?? patient?.comment ?? patient?.notes ?? "";

  const visits = useMemo(() => normalizeList(history), [history]);

  return (
    <div className="dpd-page">
      <div className="dpd-top">
        <div className="dpd-breadcrumbs">
          <Link className="dpd-back" to="/doctor/patients">
            ← Клиенты
          </Link>
          <span className="dpd-sep">/</span>
          <span>Редактирование клиента</span>
        </div>

        <div className="dpd-header">
          <div className="dpd-avatar">{initialsFromName(name)}</div>

          <div className="dpd-headText">
            <div className="dpd-title">{name}</div>
            <div className="dpd-sub">{phone}</div>
          </div>

          <div className="dpd-headRight">
            <div className="dpd-pill">
              <span className="dpd-pillLabel">ID</span>
              <span className="dpd-pillValue">#{id}</span>
            </div>
          </div>
        </div>

        <div className="dpd-tabs">
          <button
            className={`dpd-tab ${tab === "profile" ? "is-active" : ""}`}
            onClick={() => setTab("profile")}
            type="button"
          >
            Профиль клиента
          </button>
          <button
            className={`dpd-tab ${tab === "history" ? "is-active" : ""}`}
            onClick={() => setTab("history")}
            type="button"
          >
            История посещений
          </button>
        </div>
      </div>

      {loading && <div className="dpd-loading">Loading…</div>}

      {err && (
        <div className="dpd-error">
          <div className="dpd-errorTitle">Ошибка</div>
          <div className="dpd-errorBody">
            {typeof err === "string" ? err : JSON.stringify(err)}
          </div>
        </div>
      )}

      {!loading && !err && (
        <div className="dpd-content">
          {tab === "profile" && (
            <div className="dpd-card">
              <div className="dpd-cardTitle">Клиент</div>

              <div className="dpd-grid">
                <div className="dpd-field">
                  <div className="dpd-label">ФИО</div>
                  <div className="dpd-value">{name}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">Телефон</div>
                  <div className="dpd-value">{phone}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">Почта</div>
                  <div className="dpd-value">{email}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">Дата рождения</div>
                  <div className="dpd-value">{fmtDate(birthDate)}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">Пол</div>
                  <div className="dpd-value">{gender}</div>
                </div>
              </div>

              <div className="dpd-divider" />

              <div className="dpd-cardTitle">Статус клиента</div>

              <div className="dpd-grid dpd-grid4">
                <div className="dpd-field">
                  <div className="dpd-label">Статус</div>
                  <div className="dpd-value">{String(status ?? "—")}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">Долг</div>
                  <div className="dpd-value">{String(debt ?? 0)}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">Скидка</div>
                  <div className="dpd-value">{String(discount ?? 0)}</div>
                </div>

                <div className="dpd-field">
                  <div className="dpd-label">ID</div>
                  <div className="dpd-value">#{id}</div>
                </div>
              </div>

              <div className="dpd-divider" />

              <div className="dpd-cardTitle">Дополнительная информация</div>
              <div className="dpd-textBox">
                {description?.trim() ? description : "—"}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="dpd-card">
              <div className="dpd-cardTitle">История посещений</div>

              {visits.length === 0 ? (
                <div className="dpd-empty">Записей нет</div>
              ) : (
                <div className="dpd-tableWrap">
                  <table className="dpd-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Дата</th>
                        <th>Врач</th>
                        <th>Услуга</th>
                        <th>Кабинет</th>
                        <th>Статус</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((v) => {
                        const vid = v?.id ?? v?.appointment_id ?? "—";
                        const dt = v?.start_at ?? v?.start ?? v?.created_at ?? v?.date ?? null;

                        const doctor =
                          v?.doctor_name ??
                          v?.doctor?.full_name ??
                          v?.doctor?.doctor_profile?.full_name ??
                          (v?.doctor ? `Doctor #${v.doctor}` : "—");

                        const service =
                          v?.service_name ??
                          v?.service?.name ??
                          v?.service?.name_ru ??
                          v?.service?.name_en ??
                          (v?.service ? `Service #${v.service}` : "—");

                        const room =
                          v?.room?.name ??
                          (v?.room ? `Room #${v.room}` : "—");

                        const st = v?.status ?? "—";

                        return (
                          <tr key={`${vid}-${dt ?? ""}`}>
                            <td className="dpd-mono">{vid}</td>
                            <td className="dpd-mono">{fmtDateTime(dt)}</td>
                            <td>{doctor}</td>
                            <td>{service}</td>
                            <td>{room}</td>
                            <td>
                              <span className={`dpd-status dpd-status--${String(st).toLowerCase()}`}>
                                {st}
                              </span>
                            </td>
                            <td className="dpd-actions">
                              {vid !== "—" ? (
                                <Link className="dpd-linkBtn" to={`/doctor/appointments/${vid}`}>
                                  Открыть
                                </Link>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Если хочешь — можно оставить это, но не raw по умолчанию */}
              {/* <details className="dpd-details">
                <summary>Показать raw (debug)</summary>
                <pre className="dpd-pre">{JSON.stringify(history, null, 2)}</pre>
              </details> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
