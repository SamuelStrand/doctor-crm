import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/login.css";

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
    <div className="loginPage">
      <div className="loginCard">
        <h2 className="loginTitle">Login</h2>

        <form onSubmit={onSubmit} className="loginForm">
          <label className="loginLabel">
            Email
            <input
              className="loginInput"
              placeholder="admin@clinic.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="loginLabel">
            Password
            <input
              className="loginInput"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button className="loginButton" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {err && (
          <pre className="loginError">{JSON.stringify(err, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
