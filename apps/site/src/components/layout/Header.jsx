import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { createLocalizedPath, getLangFromPath } from "../../utils/localeRouting";

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f8f7f2]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <NavLink to={createLocalizedPath(lang, "/")} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111111] text-lg font-black text-yellow-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            Q
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#111111]">
              {t("brand.name")}
            </div>
            <div className="text-xs text-black/45">{t("brand.tagline")}</div>
          </div>
        </NavLink>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-black/8 bg-white/80 p-1 shadow-sm">
            <HeaderLink to={createLocalizedPath(lang, "/")}>{t("nav.home")}</HeaderLink>
            <HeaderLink to={createLocalizedPath(lang, "/about")}>
              {t("nav.about")}
            </HeaderLink>
            <HeaderLink to={createLocalizedPath(lang, "/trust-safety")}>
              {t("nav.trustSafety")}
            </HeaderLink>
            <HeaderLink to={createLocalizedPath(lang, "/contact")}>
              {t("nav.contact")}
            </HeaderLink>
          </nav>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${
          isActive ? "bg-[#111111] text-yellow-300" : "text-black/55"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
