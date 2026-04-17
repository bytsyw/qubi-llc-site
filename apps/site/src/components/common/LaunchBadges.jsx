import { motion } from "framer-motion";
import { Smartphone, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LaunchBadge({ label, icon: Icon = Sparkles, dark = false }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
        dark
          ? "border-white/10 bg-white/5 text-white/72"
          : "border-black/8 bg-yellow-100 text-black/72"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </motion.div>
  );
}

export function StoreLaunchRow({ dark = false, className = "" }) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <LaunchBadge dark={dark} icon={Smartphone} label={t("launch.appStoreComingSoon")} />
      <LaunchBadge dark={dark} icon={Sparkles} label={t("launch.googlePlayComingSoon")} />
    </div>
  );
}
