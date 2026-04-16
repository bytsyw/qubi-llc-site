import appsEn from "./en/apps";
import appsTr from "./tr/apps";
import { normalizeLang } from "../utils/localeRouting";

export function getLocalizedApps(lang) {
  const safeLang = normalizeLang(lang);
  return safeLang === "tr" ? appsTr : appsEn;
}