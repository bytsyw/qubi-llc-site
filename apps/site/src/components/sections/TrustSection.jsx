import { motion } from "framer-motion";
import { Eye, MessageCircleHeart, ShieldCheck, SmilePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../common/Surface";

const trustIcons = [ShieldCheck, Eye, SmilePlus];

export default function TrustSection() {
  const { t } = useTranslation("trust");
  const trustItems = t("section.items", { returnObjects: true });
  const testimonials = t("testimonials", { returnObjects: true });

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="p-6 lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
            <ShieldCheck className="h-4 w-4" />
            {t("section.badge")}
          </div>

          <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
            {t("section.title")}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-black/62">
            {t("section.description")}
          </p>

          <div className="mt-8 grid gap-4">
            {trustItems.map((item, index) => {
              const Icon = trustIcons[index];

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.7rem] border border-black/8 bg-[#f8f7f2] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-300 text-black">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-[#111111]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-black/60">{item.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-5">
          <Card className="p-6 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
              <MessageCircleHeart className="h-4 w-4" />
              {t("panel.badge")}
            </div>

            <h3 className="mt-5 text-2xl font-black leading-tight text-[#111111]">
              {t("panel.title")}
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-7 text-black/60">
              {t("panel.description")}
            </p>

            <div className="mt-6 space-y-4">
              <TrustMetric label={t("panel.metrics.visualTrust")} value="92%" />
              <TrustMetric label={t("panel.metrics.parentStructure")} value="95%" />
              <TrustMetric label={t("panel.metrics.lowFriction")} value="91%" />
              <TrustMetric label={t("panel.metrics.brandConfidence")} value="94%" />
            </div>
          </Card>

          <div className="grid gap-4">
            {testimonials.map((item, index) => (
              <motion.div
                key={item.author + index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
              >
                <div className="text-base leading-8 text-black/72">“{item.quote}”</div>
                <div className="mt-5">
                  <div className="text-sm font-black text-[#111111]">{item.author}</div>
                  <div className="text-sm text-black/50">{item.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustMetric({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[1.3rem] border border-black/8 bg-[#f8f7f2] px-4 py-3">
      <div className="text-sm font-medium text-black/68">{label}</div>
      <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-black text-[#111111]">
        {value}
      </div>
    </div>
  );
}
