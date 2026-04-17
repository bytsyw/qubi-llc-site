import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, Mail, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { StoreLaunchRow } from "../common/LaunchBadges";
import { createLocalizedPath, getLangFromPath } from "../../utils/localeRouting";

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  return (
    <footer className="border-t border-black/8 bg-[#111111] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <NavLink
              to={createLocalizedPath(lang, "/")}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300 text-lg font-black text-black shadow-[0_10px_30px_rgba(250,204,21,0.18)]">
                Q
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.24em] text-white">
                  {t("brand.name")}
                </div>
                <div className="text-xs text-white/45">{t("brand.tagline")}</div>
              </div>
            </NavLink>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/68">
              {t("footer.description")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75">
                {t("footer.safeFirst")}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75">
                {t("footer.globalReady")}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75">
                {t("footer.parentGuided")}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
              {t("footer.navigation")}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <FooterNavLink to={createLocalizedPath(lang, "/")} label={t("nav.home")} />
              <FooterNavLink
                to={createLocalizedPath(lang, "/about")}
                label={t("nav.about")}
              />
              <FooterNavLink
                to={createLocalizedPath(lang, "/trust-safety")}
                label={t("nav.trustSafety")}
              />
              <FooterNavLink
                to={createLocalizedPath(lang, "/contact")}
                label={t("nav.contact")}
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
              {t("footer.legal")}
            </div>

            <div className="mt-5 space-y-3">
              <FooterInfoRow
                icon={ShieldCheck}
                title={t("footer.childrenSafetyTitle")}
                text={t("footer.childrenSafetyText")}
              />
              <FooterNavLink
                to={createLocalizedPath(lang, "/privacy-policy")}
                label={t("footer.privacyPolicy")}
              />
              <FooterNavLink
                to={createLocalizedPath(lang, "/terms-of-use")}
                label={t("footer.termsOfUse")}
              />
              <FooterNavLink
                to={createLocalizedPath(lang, "/parent-safety-guide")}
                label={t("footer.parentSafetyGuide")}
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
              {t("footer.contact")}
            </div>

            <div className="mt-5 space-y-3">
              <FooterInfoRow
                icon={Mail}
                title={t("footer.emailTitle")}
                text="hello@qubillc.com"
              />
              <FooterInfoRow
                icon={MapPin}
                title={t("footer.locationTitle")}
                text={t("footer.locationText")}
              />
              <FooterInfoRow
                icon={Sparkles}
                title={t("footer.partnershipsTitle")}
                text={t("footer.partnershipsText")}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 h-px w-full bg-white/10" />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/45">{t("footer.copyright")}</div>
          <StoreLaunchRow dark />
        </div>
      </div>
    </footer>
  );
}

function FooterNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between rounded-[1.1rem] border px-4 py-3 text-left text-sm font-semibold transition ${
          isActive
            ? "border-yellow-300/35 bg-yellow-300/10 text-yellow-300"
            : "border-white/10 bg-white/5 text-white/72 hover:bg-white/8"
        }`
      }
    >
      <span>{label}</span>
      <ExternalLink className="h-4 w-4 opacity-70" />
    </NavLink>
  );
}

function FooterInfoRow({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-yellow-300 text-black">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{title}</div>
          <div className="mt-1 text-sm leading-6 text-white/60">{text}</div>
        </div>
      </div>
    </div>
  );
}
