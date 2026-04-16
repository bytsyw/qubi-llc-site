import { motion } from "framer-motion";
import { Globe2, HeartHandshake, Sparkles, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../common/Surface";

const pillarIcons = [Target, HeartHandshake, Globe2];

export default function AboutSection() {
  const { t } = useTranslation("about");
  const pillars = t("section.pillars", { returnObjects: true });

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6 lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-yellow-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/70">
            <Sparkles className="h-4 w-4" />
            {t("section.badge")}
          </div>

          <h2 className="mt-5 max-w-xl text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
            {t("section.title")}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-black/62">
            {t("section.description1")}
          </p>

          <p className="mt-4 max-w-2xl text-base leading-7 text-black/62">
            {t("section.description2")}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatChip
              value={t("section.stats.appsValue")}
              label={t("section.stats.appsLabel")}
            />
            <StatChip
              value={t("section.stats.globalValue")}
              label={t("section.stats.globalLabel")}
            />
            <StatChip
              value={t("section.stats.parentValue")}
              label={t("section.stats.parentLabel")}
            />
          </div>
        </Card>

        <div className="grid gap-5">
          {pillars.map((item, index) => {
            const Icon = pillarIcons[index];

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111111] text-yellow-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#111111]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-black/60">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatChip({ value, label }) {
  return (
    <div className="rounded-[1.5rem] border border-black/8 bg-[#f8f7f2] p-4">
      <div className="text-2xl font-black text-[#111111]">{value}</div>
      <div className="mt-1 text-sm text-black/55">{label}</div>
    </div>
  );
}