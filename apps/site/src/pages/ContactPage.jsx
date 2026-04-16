import { useTranslation } from "react-i18next";
import Seo from "../components/seo/Seo";

export default function ContactPage() {
  const { t } = useTranslation("contact");

  return (
    <>
      <Seo
        title={t("seo.title")}
        description={t("seo.description")}
      />

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-600">
              {t("hero.badge")}
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-base leading-7 text-black/62 sm:text-lg">
              {t("hero.description")}
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-600">
                {t("general.badge")}
              </div>
              <h2 className="mt-3 text-2xl font-black text-[#111111]">
                {t("general.title")}
              </h2>
              <p className="mt-4 text-sm leading-7 text-black/60">
                {t("general.description")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/8 bg-[#111111] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
                {t("partnership.badge")}
              </div>
              <h2 className="mt-3 text-2xl font-black">
                {t("partnership.title")}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                {t("partnership.description")}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}