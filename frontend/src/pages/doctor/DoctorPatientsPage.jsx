import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { unwrapPaginated } from "../../utils/paginated";

export default function DoctorPatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await doctorApi.listPatients({
        page,
        ...(search ? { search } : {}),
      });
      const { items, count } = unwrapPaginated(data);
      setItems(items);
      setCount(count);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]); // eslint-disable-line

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Doctor • Patients</h2>

      <form onSubmit={onSearch} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients..."
          style={{ width: 360 }}
        />
        <button type="submit">Search</button>
        <button type="button" onClick={() => { setSearch(""); setPage(1); setTimeout(load, 0); }}>
          Reset
        </button>
        <span style={{ marginLeft: "auto" }}>Total: {count}</span>
      </form>

      {loading && <p>Loading…</p>}
      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}

      {!loading && (
        <>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full name</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.full_name ?? p.name ?? "-"}</td>
                  <td>{p.phone ?? "-"}</td>
                  <td>
                    <Link to={`/doctor/patients/${p.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="4">No patients</td></tr>}
            </tbody>
          </table>

          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {page}</span>
            <button disabled={items.length === 0} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
