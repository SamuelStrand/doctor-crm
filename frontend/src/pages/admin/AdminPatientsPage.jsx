import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { unwrapPaginated } from "../../utils/paginated";

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminPatientsPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // form
  const [editingId, setEditingId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [gender, setGender] = useState("U"); // M/F/O/U
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  const queryParams = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, debouncedSearch]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listPatients(queryParams);
      const { items, count } = unwrapPaginated(data);
      setItems(items);
      setCount(count);
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [queryParams]); // eslint-disable-line

  const resetForm = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setMiddleName("");
    setBirthDate("");
    setGender("U");
    setPhone("");
    setEmail("");
    setAddress("");
    setComment("");
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setFirstName(p.first_name ?? "");
    setLastName(p.last_name ?? "");
    setMiddleName(p.middle_name ?? "");
    setBirthDate(p.birth_date ?? "");
    setGender(p.gender ?? "U");
    setPhone(p.phone ?? "");
    setEmail(p.email ?? "");
    setAddress(p.address ?? "");
    setComment(p.comment ?? "");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    // минимальная валидация (чтобы бэк не ругался)
    if (!firstName.trim() || !lastName.trim()) {
      setErr({ detail: "first_name and last_name are required" });
      return;
    }

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName.trim() || null,
        birth_date: birthDate || null,
        gender: gender || "U",
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        comment: comment || null,
      };

      if (!editingId) await adminApi.createPatient(payload);
      else await adminApi.patchPatient(editingId, payload);

      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete patient?")) return;
    setErr(null);
    try {
      await adminApi.deletePatient(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin • Patients</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search patients (name, phone, email...)"
          style={{ padding: 8, minWidth: 280 }}
        />

        <button onClick={() => { setPage(1); setSearch(""); }}>
          Clear search
        </button>

        <span style={{ marginLeft: "auto", color: "#666" }}>Total: {count}</span>
      </div>

      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}
      {loading && <p>Loading…</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginBottom: 16 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>First</th>
            <th>Last</th>
            <th>Middle</th>
            <th>Birth</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.first_name ?? "-"}</td>
              <td>{p.last_name ?? "-"}</td>
              <td>{p.middle_name ?? "-"}</td>
              <td>{p.birth_date ?? "-"}</td>
              <td>{p.gender ?? "-"}</td>
              <td>{p.phone ?? "-"}</td>
              <td>{p.email ?? "-"}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="9">No patients</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>{editingId ? `Edit patient #${editingId}` : "Create patient"}</h3>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 700 }}>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name *" />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name *" />
          <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" />
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="U">U (Unknown)</option>
            <option value="M">M (Male)</option>
            <option value="F">F (Female)</option>
            <option value="O">O (Other)</option>
          </select>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
        </div>

        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment" />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editingId ? "Save" : "Create"}</button>
          <button type="button" onClick={resetForm}>Clear</button>
        </div>
      </form>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page}</span>
        <button disabled={items.length === 0} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
