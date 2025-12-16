import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";

export default function AdminAppointmentDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [a, setA] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.getAppointment(id);
      setA(data);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const del = async () => {
    if (!confirm("Delete this appointment?")) return;
    setDeleting(true);
    setErr(null);
    try {
      await adminApi.deleteAppointment(id);
      nav("/admin/appointments");
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/admin/appointments">← Back</Link>
        <h2 style={{ margin: 0 }}>Admin • Appointment #{id}</h2>
      </div>

      {loading && <p>Loading…</p>}
      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}

      {a && (
        <>
          <pre style={{ background: "#f6f6f6", padding: 12 }}>{JSON.stringify(a, null, 2)}</pre>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link to={`/admin/appointments/${id}/edit`}><button>Edit</button></Link>
            <button onClick={del} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
