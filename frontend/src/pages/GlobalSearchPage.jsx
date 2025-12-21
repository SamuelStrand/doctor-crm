// frontend/src/pages/GlobalSearchPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { commonApi } from "../api/commonApi";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { useTranslation } from "react-i18next";
import "../styles/GlobalSearchPage.css";

function fmtDT(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const pad2 = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

function pickFullName(obj) {
  if (!obj) return "—";
  if (obj.full_name) return obj.full_name;

  const parts = [obj.last_name, obj.first_name, obj.middle_name].filter(Boolean);
  if (parts.length) return parts.join(" ");

  if (obj.doctor_profile?.full_name) return obj.doctor_profile.full_name;

  return obj.email || obj.username || obj.name || `#${obj.id ?? "—"}`;
}

export default function GlobalSearchPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 350);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ patients: [], services: [], appointments: [] });

  const role = useMemo(() => localStorage.getItem("role") || "", []);

  useEffect(() => {
    let alive = true;

    async function run() {
      const query = String(dq || "").trim();
      if (!query) {
        setData({ patients: [], services: [], appointments: [] });
        setErr("");
        return;
      }
      setLoading(true);
      setErr("");
      try {
        const resp = await commonApi.search({ q: query });
        if (!alive) return;
        setData({
          patients: resp.data?.patients || [],
          services: resp.data?.services || [],
          appointments: resp.data?.appointments || [],
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Search failed");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [dq]);

  const apptLink = (id) => {
    if (String(role).toUpperCase() === "ADMIN") return `/admin/appointments/${id}`;
    return `/doctor/appointments/${id}`;
  };

  return (
  <div className="gsPage2">
    <div className="gsTop2">
      <div className="gsCrumb2">{t("nav.search")}</div>
      <div className="gsTitle2">{t("searchPage.title")}</div>

      <div className="gsToolbar2">
        <div className="gsSearch2">
          <span className="gsSearchIcon2">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPage.placeholder")}
            className="gsSearchInput2"
          />
        </div>

        {/* справа как в твоём примере (можешь потом реально сделать фильтры) */}
        
      </div>

      <div className="gsMeta2">
        <div className="gsTotal2">
          Total:{" "}
          {data.patients.length + data.services.length + data.appointments.length}
        </div>

        <div className="gsStatus2">
          {loading ? <span className="gsLoading2">{t("searchPage.loading")}</span> : null}
          {err ? <span className="gsError2">{err}</span> : null}
        </div>
      </div>
    </div>

    <div className="gsGrid2">
      {/* Patients */}
      {data.patients.map((p) => (
        <div key={`p-${p.id}`} className="gsCard2">
          <div className="gsCardHead2">
            <div className="gsAvatar2">P</div>

            <div className="gsCardHeadMain2">
              <div className="gsNameRow2">
                <div className="gsName2">{pickFullName(p)}</div>
                <span className="gsPill2 gsPillPatient2">Patient</span>
              </div>

              <div className="gsSub2">{p.phone || "—"}</div>
            </div>

            {String(role).toUpperCase() === "ADMIN" ? (
              <Link to={`/admin/patients/${p.id}`} className="gsDots2" title="Open">
                ⋮
              </Link>
            ) : (
              <span className="gsDots2" aria-hidden>⋮</span>
            )}
          </div>

          <div className="gsCardBody2">
            <div className="gsLine2">
              <span className="gsLabel2">Phone</span>
              <span className="gsValue2">{p.phone || "—"}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Services */}
      {data.services.map((s) => (
        <div key={`s-${s.id}`} className="gsCard2">
          <div className="gsCardHead2">
            <div className="gsAvatar2">S</div>

            <div className="gsCardHeadMain2">
              <div className="gsNameRow2">
                <div className="gsName2">{s.name || `#${s.id}`}</div>
                <span className="gsPill2 gsPillService2">Service</span>
              </div>
              <div className="gsSub2">
                {s.code ? `Code: ${s.code}` : "—"}
              </div>
            </div>

            {String(role).toUpperCase() === "ADMIN" ? (
              <Link to={`/admin/services/${s.id}`} className="gsDots2" title="Open">
                ⋮
              </Link>
            ) : (
              <span className="gsDots2" aria-hidden>⋮</span>
            )}
          </div>

          <div className="gsCardBody2">
            <div className="gsLine2">
              <span className="gsLabel2">Duration</span>
              <span className="gsValue2">{s.duration_min ? `${s.duration_min}m` : "—"}</span>
            </div>
            <div className="gsLine2">
              <span className="gsLabel2">Price</span>
              <span className="gsValue2">{typeof s.price !== "undefined" ? s.price : "—"}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Appointments */}
      {data.appointments.map((a) => (
        <div key={`a-${a.id}`} className="gsCard2">
          <div className="gsCardHead2">
            <div className="gsAvatar2">A</div>

            <div className="gsCardHeadMain2">
              <div className="gsNameRow2">
                <div className="gsName2">
                  <Link to={apptLink(a.id)} className="gsApptLink2">
                    #{a.id}
                  </Link>
                </div>
                <span className="gsPill2 gsPillAppt2">Appointment</span>
              </div>

              <div className="gsSub2">{fmtDT(a.starts_at)}</div>
            </div>

            <Link to={apptLink(a.id)} className="gsDots2" title="Open">
              ⋮
            </Link>
          </div>

          <div className="gsCardBody2">
            <div className="gsLine2">
              <span className="gsLabel2">Patient</span>
              <span className="gsValue2">{a.patient_name || "—"}</span>
            </div>
            <div className="gsLine2">
              <span className="gsLabel2">Doctor</span>
              <span className="gsValue2">{a.doctor_name || "—"}</span>
            </div>
            <div className="gsLine2">
              <span className="gsLabel2">Service</span>
              <span className="gsValue2">{a.service_name || "—"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

}
