import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enCommon from "../locales/en/common.json";
import trCommon from "../locales/tr/common.json";
import enHome from "../locales/en/home.json";
import trHome from "../locales/tr/home.json";
import enContact from "../locales/en/contact.json";
import trContact from "../locales/tr/contact.json";
import enAbout from "../locales/en/about.json";
import trAbout from "../locales/tr/about.json";
import enTrust from "../locales/en/trust.json";
import trTrust from "../locales/tr/trust.json";
import enLegal from "../locales/en/legal.json";
import trLegal from "../locales/tr/legal.json";
import enAppDetail from "../locales/en/appDetail.json";
import trAppDetail from "../locales/tr/appDetail.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        contact: enContact,
        about: enAbout,
        trust: enTrust,
        legal: enLegal,
        appDetail: enAppDetail,
      },
      tr: {
        common: trCommon,
        home: trHome,
        contact: trContact,
        about: trAbout,
        trust: trTrust,
        legal: trLegal,
        appDetail: trAppDetail,
      },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "tr"],
    defaultNS: "common",
    ns: ["common", "home", "contact", "about", "trust", "legal", "appDetail"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
