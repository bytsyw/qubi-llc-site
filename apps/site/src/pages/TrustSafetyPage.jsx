import { useTranslation } from "react-i18next";
import Seo from "../components/seo/Seo";
import TrustSection from "../components/sections/TrustSection";

export default function TrustSafetyPage() {
  const { t } = useTranslation("trust");

  return (
    <>
      <Seo
        title={t("seo.title")}
        description={t("seo.description")}
      />

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-2 pt-10 lg:px-8 lg:pt-14">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-600">
              {t("page.badge")}
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
              {t("page.title")}
            </h1>
            <p className="mt-5 text-base leading-7 text-black/62 sm:text-lg">
              {t("page.description")}
            </p>
          </div>
        </section>

        <TrustSection />
      </main>
    </>
  );
}