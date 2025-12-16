import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";

export default function AdminRoomsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [comment, setComment] = useState("");

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listRooms({ page });
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
    setName("");
    setFloor("");
    setComment("");
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setName(r.name ?? "");
    setFloor(r.floor ?? "");
    setComment(r.comment ?? "");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const payload = {
        name,
        floor: floor === "" ? null : Number(floor),
        comment,
      };
      if (!editingId) await adminApi.createRoom(payload);
      else await adminApi.patchRoom(editingId, payload);
      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete room?")) return;
    setErr(null);
    try {
      await adminApi.deleteRoom(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin • Rooms</h2>

      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}
      {loading && <p>Loading…</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginBottom: 16 }}>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Floor</th><th>Comment</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.floor ?? "-"}</td>
              <td>{r.comment ?? "-"}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(r)}>Edit</button>
                <button onClick={() => remove(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan="5">No rooms</td></tr>}
        </tbody>
      </table>

      <h3>{editingId ? `Edit room #${editingId}` : "Create room"}</h3>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (required)" />
        <input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Floor (optional)" type="number" />
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment (optional)" />

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
