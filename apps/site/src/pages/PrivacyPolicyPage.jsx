import { useTranslation } from "react-i18next";
import Seo from "../components/seo/Seo";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation("legal");
  const blocks = t("privacy.blocks", { returnObjects: true });

  return (
    <>
      <Seo
        title={t("privacy.seo.title")}
        description={t("privacy.seo.description")}
      />

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="max-w-4xl">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-600">
              {t("privacy.badge")}
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
              {t("privacy.title")}
            </h1>

            <p className="mt-5 text-base leading-7 text-black/62 sm:text-lg">
              {t("privacy.description")}
            </p>

            <div className="mt-10 space-y-6">
              {blocks.map((item) => (
                <LegalBlock key={item.title} title={item.title} text={item.text} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function LegalBlock({ title, text }) {
  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <h2 className="text-xl font-black text-[#111111]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-black/60">{text}</p>
    </div>
  );
}