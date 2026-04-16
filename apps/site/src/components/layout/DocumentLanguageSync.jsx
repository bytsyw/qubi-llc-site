import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLangFromPath } from "../../utils/localeRouting";

export default function DocumentLanguageSync() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = getLangFromPath(location.pathname);

    if (i18n.resolvedLanguage !== currentLang) {
      i18n.changeLanguage(currentLang);
    }

    document.documentElement.lang = currentLang;
  }, [location.pathname, i18n]);

  return null;
}