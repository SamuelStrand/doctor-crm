import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const me = await login({ email, password });

      if (me.role === "ADMIN") nav("/admin", { replace: true });
      else if (me.role === "DOCTOR") nav("/doctor", { replace: true });
      else nav("/", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data ?? { detail: e2.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Login</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} type="submit">
          {loading ? "..." : "Sign in"}
        </button>
      </form>

      {err && (
        <pre style={{ marginTop: 12, background: "#eee", padding: 12 }}>
          {JSON.stringify(err, null, 2)}
        </pre>
      )}
    </div>
  );
}
