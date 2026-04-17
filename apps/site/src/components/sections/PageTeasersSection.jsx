import { motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createLocalizedPath, getLangFromPath } from "../../utils/localeRouting";

export default function PageTeasersSection() {
  const { t } = useTranslation("home");
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  const teaserItems = t("teasers.cards", { returnObjects: true });
  const teaserIcons = [Sparkles, ShieldCheck, Mail];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
      <div className="mb-8 max-w-3xl">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-600">
          {t("teasers.badge")}
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
          {t("teasers.title")}
        </h2>
        <p className="mt-5 text-base leading-7 text-black/62">
          {t("teasers.description")}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {teaserItems.map((item, index) => {
          const Icon = teaserIcons[index];

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <Link
                to={createLocalizedPath(lang, item.path)}
                className="block rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] transition hover:shadow-[0_24px_70px_rgba(0,0,0,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-yellow-300">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="mt-5 inline-flex rounded-full border border-black/8 bg-yellow-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/70">
                  {item.badge}
                </div>

                <h3 className="mt-5 text-2xl font-black leading-tight text-[#111111]">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-black/60">{item.text}</p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#111111]">
                  {t("teasers.learnMore")}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
