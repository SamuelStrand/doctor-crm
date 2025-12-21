import React from "react";
import { Link } from "react-router-dom";
import "../../styles/adminDashboard.css";
import { useTranslation } from "react-i18next";

function Card({ title, desc, to }) {
  return (
    <Link to={to} className="adminDashCard">
      <div className="adminDashCardTop">
        <div className="adminDashCardTitle">{title}</div>
        <div className="adminDashCardArrow">→</div>
      </div>
      <div className="adminDashCardDesc">{desc}</div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="adminDashPage">
      <div className="adminDashContainer">
        <div className="adminDashHeader">
          <div>
            <h2 className="adminDashTitle">{t("admin.dashboard.title")}</h2>
            <p className="adminDashSubtitle">{t("admin.dashboard.subtitle")}</p>

            <div className="adminDashBadgeRow">
              <span className="adminDashBadge">{t("admin.dashboard.badges.crud")}</span>
              <span className="adminDashBadge">{t("admin.dashboard.badges.search")}</span>
              <span className="adminDashBadge">{t("admin.dashboard.badges.roleAccess")}</span>
            </div>
          </div>
        </div>

        <div className="adminDashGrid">
          <Card
            title={t("admin.dashboard.cards.appointments.title")}
            desc={t("admin.dashboard.cards.appointments.desc")}
            to="/admin/appointments"
          />
          <Card
            title={t("admin.dashboard.cards.patients.title")}
            desc={t("admin.dashboard.cards.patients.desc")}
            to="/admin/patients"
          />
          <Card
            title={t("admin.dashboard.cards.doctors.title")}
            desc={t("admin.dashboard.cards.doctors.desc")}
            to="/admin/doctors"
          />
          <Card
            title={t("admin.dashboard.cards.services.title")}
            desc={t("admin.dashboard.cards.services.desc")}
            to="/admin/services"
          />
          <Card
            title={t("admin.dashboard.cards.rooms.title")}
            desc={t("admin.dashboard.cards.rooms.desc")}
            to="/admin/rooms"
          />
          <Card
            title={t("admin.dashboard.cards.schedule.title")}
            desc={t("admin.dashboard.cards.schedule.desc")}
            to="/admin/schedule"
          />
        </div>

        <div className="adminDashFooter">{t("admin.dashboard.footerTip")}</div>
      </div>
    </div>
  );
}
