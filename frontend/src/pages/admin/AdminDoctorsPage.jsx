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

export default function AdminDoctorsPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // form
  const [editingId, setEditingId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // create: required, edit: optional
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");

  const queryParams = useMemo(() => {
    const p = { page };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [page, debouncedSearch]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminApi.listDoctors(queryParams);
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
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setIsActive(true);
    setFullName("");
    setSpecialization("");
    setDoctorPhone("");
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEmail(d.email ?? "");
    setPassword(""); // не показываем текущий пароль
    setFirstName(d.first_name ?? "");
    setLastName(d.last_name ?? "");
    setIsActive(d.is_active ?? true);
    setFullName(d.doctor_profile?.full_name ?? "");
    setSpecialization(d.doctor_profile?.specialization ?? "");
    setDoctorPhone(d.doctor_profile?.phone ?? "");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!email.trim()) {
      setErr({ detail: "email is required" });
      return;
    }
    if (!editingId && !password) {
      setErr({ detail: "password is required for new doctor" });
      return;
    }

    try {
      const payload = {
        email: email.trim(),
        first_name: firstName.trim() || "",
        last_name: lastName.trim() || "",
        is_active: !!isActive,
        doctor_profile: {
          full_name: fullName.trim() || "",
          specialization: specialization.trim() || "",
          phone: doctorPhone.trim() || "",
        },
      };

      if (!editingId) {
        payload.password = password;
        await adminApi.createDoctor(payload);
      } else {
        if (password) payload.password = password; // менять пароль только если ввели
        await adminApi.patchDoctor(editingId, payload);
      }

      resetForm();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete doctor?")) return;
    setErr(null);
    try {
      await adminApi.deleteDoctor(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data ?? { detail: e.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin • Doctors</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search doctors (email, name, specialization...)"
          style={{ padding: 8, minWidth: 280 }}
        />
        <button onClick={() => { setPage(1); setSearch(""); }}>Clear search</button>
        <span style={{ marginLeft: "auto", color: "#666" }}>Total: {count}</span>
      </div>

      {err && <pre style={{ background: "#eee", padding: 12 }}>{JSON.stringify(err, null, 2)}</pre>}
      {loading && <p>Loading…</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginBottom: 16 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>First</th>
            <th>Last</th>
            <th>Full name</th>
            <th>Specialization</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.email ?? "-"}</td>
              <td>{d.first_name ?? "-"}</td>
              <td>{d.last_name ?? "-"}</td>
              <td>{d.doctor_profile?.full_name ?? "-"}</td>
              <td>{d.doctor_profile?.specialization ?? "-"}</td>
              <td>{String(d.is_active ?? true)}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(d)}>Edit</button>
                <button onClick={() => remove(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan="8">No doctors</td></tr>}
        </tbody>
      </table>

      <h3>{editingId ? `Edit doctor #${editingId}` : "Create doctor"}</h3>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 760 }}>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={editingId ? "New password (optional)" : "Password *"}
            type="password"
          />
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Doctor full name" />
          <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Specialization" />
          <input value={doctorPhone} onChange={(e) => setDoctorPhone(e.target.value)} placeholder="Doctor phone" />
        </div>

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
