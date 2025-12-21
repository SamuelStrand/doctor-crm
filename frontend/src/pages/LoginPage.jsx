import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "../styles/login.css";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
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
        <h2 className="loginTitle">{t("auth.login")}</h2>

        <form onSubmit={onSubmit} className="loginForm">
          <label className="loginLabel">
            {t("auth.email")}
            <input
              className="loginInput"
              placeholder="admin@clinic.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="loginLabel">
            {t("auth.password")}
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
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>
        </form>

        {err && <pre className="loginError">{JSON.stringify(err, null, 2)}</pre>}
      </div>
    </div>
  );
}
