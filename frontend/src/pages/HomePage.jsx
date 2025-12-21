import "../styles/home.css";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="homePage">
      <div className="homeCard">
        <h2 className="homeTitle">{t("home.title")}</h2>

        <p className="homeSubtitle">{t("home.subtitle")}</p>

        <div className="homeBadgeRow">
          <span className="homeBadge">{t("home.badges.roleAccess")}</span>
          <span className="homeBadge">{t("home.badges.calendar")}</span>
          <span className="homeBadge">{t("home.badges.adminCrud")}</span>
        </div>

        <div className="homeGrid">
          <div className="homeItem">
            <p className="homeItemTitle">{t("home.sections.who.title")}</p>
            <p className="homeItemText">
              {t("home.sections.who.text")}
            </p>
          </div>

          <div className="homeItem">
            <p className="homeItemTitle">{t("home.sections.admin.title")}</p>
            <p className="homeItemText">{t("home.sections.admin.text")}</p>
          </div>

          <div className="homeItem">
            <p className="homeItemTitle">{t("home.sections.doctor.title")}</p>
            <p className="homeItemText">{t("home.sections.doctor.text")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
