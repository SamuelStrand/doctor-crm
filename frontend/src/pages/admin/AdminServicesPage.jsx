import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listServices({ page });
      const { items } = unwrapPaginated(data);
      setItems(items);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]); // eslint-disable-line

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setNameEn("");
    setNameRu("");
    setDuration("");
    setPrice("");
    setIsActive(true);
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setCode(s.code ?? "");
    setNameEn(s.name_en ?? "");
    setNameRu(s.name_ru ?? "");
    setDuration(s.duration_minutes ?? "");
    setPrice(s.price ?? "");
    setIsActive(Boolean(s.is_active));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const payload = {
        code,
        name_en: nameEn,
        name_ru: nameRu,
        duration_minutes: duration === "" ? 0 : Number(duration),
        price: price === "" ? "0.00" : String(price),
        is_active: isActive,
      };
      if (!editingId) await adminApi.createService(payload);
      else await adminApi.patchService(editingId, payload);
      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete service?")) return;
    setErr(null);
    try {
      await adminApi.deleteService(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin • Services</h2>

      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}
      {loading && <p>Loading…</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginBottom: 16 }}>
        <thead>
          <tr>
            <th>ID</th><th>Code</th><th>Name EN</th><th>Name RU</th><th>Duration</th><th>Price</th><th>Active</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.code}</td>
              <td>{s.name_en}</td>
              <td>{s.name_ru ?? "-"}</td>
              <td>{s.duration_minutes ?? 0}</td>
              <td>{s.price ?? "-"}</td>
              <td>{String(Boolean(s.is_active))}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(s)}>Edit</button>
                <button onClick={() => remove(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan="8">No services</td></tr>}
        </tbody>
      </table>

      <h3>{editingId ? `Edit service #${editingId}` : "Create service"}</h3>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (required)" />
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Name EN (required)" />
        <input value={nameRu} onChange={(e) => setNameRu(e.target.value)} placeholder="Name RU" />
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration minutes" type="number" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (e.g. 100.00)" />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editingId ? "Save" : "Create"}</button>
          <button type="button" onClick={resetForm}>Clear</button>
        </div>
      </form>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
