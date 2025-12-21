import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.language || "ru").slice(0, 2);

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#666" }}>{t("common.language")}:</span>
      <button onClick={() => setLang("ru")} style={btnStyle(current === "ru")}>RU</button>
      <button onClick={() => setLang("en")} style={btnStyle(current === "en")}>EN</button>
    </div>
  );
}

function btnStyle(active) {
  return {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer",
    fontSize: 12,
  };
}
