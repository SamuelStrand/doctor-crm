import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";

export default function DoctorPatientDetailPage() {
  const { id } = useParams();
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

      // history может быть любым форматом — просто покажем
      const h = await doctorApi.getPatientHistory(id);
      setHistory(h);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/doctor/patients">← Back</Link>
        <h2 style={{ margin: 0 }}>Patient #{id}</h2>
      </div>

      {loading && <p>Loading…</p>}
      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}

      {patient && (
        <>
          <h3>Profile</h3>
          <pre style={{ background: "#f6f6f6", padding: 12 }}>{JSON.stringify(patient, null, 2)}</pre>
        </>
      )}

      {history && (
        <>
          <h3>History</h3>
          <pre style={{ background: "#f6f6f6", padding: 12 }}>{JSON.stringify(history, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
