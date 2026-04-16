import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getLangFromPath,
  replaceOrPrefixLocale,
} from "../../utils/localeRouting";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const activeLanguage = getLangFromPath(location.pathname);

  const handleChangeLanguage = (nextLang) => {
    i18n.changeLanguage(nextLang);

    navigate(
      `${replaceOrPrefixLocale(location.pathname, nextLang)}${location.search}${location.hash}`
    );
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white/80 p-1 shadow-sm">
      <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
        {t("language.label")}
      </span>

      <button
        onClick={() => handleChangeLanguage("en")}
        className={`rounded-full px-3 py-2 text-xs font-bold transition ${
          activeLanguage === "en"
            ? "bg-[#111111] text-yellow-300"
            : "text-black/55"
        }`}
      >
        {t("language.en")}
      </button>

      <button
        onClick={() => handleChangeLanguage("tr")}
        className={`rounded-full px-3 py-2 text-xs font-bold transition ${
          activeLanguage === "tr"
            ? "bg-[#111111] text-yellow-300"
            : "text-black/55"
        }`}
      >
        {t("language.tr")}
      </button>
    </div>
  );
}