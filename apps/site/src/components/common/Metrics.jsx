import { motion } from "framer-motion";

export function MiniMetric({ value, label }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-[1.6rem] border border-black/8 bg-white/80 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.05)]"
    >
      <div className="text-2xl font-black text-[#111111]">{value}</div>
      <div className="mt-1 text-sm text-black/55">{label}</div>
    </motion.div>
  );
}

export function MetricBar({ metric, delay = 0 }) {
  const Icon = metric.icon;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-100 text-black">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#111111]">{metric.label}</div>
            <div className="text-xs text-black/45">
              {metric.subtitle || "Brand metric presentation"}
            </div>
          </div>
        </div>
        <div className="text-lg font-black text-[#111111]">{metric.value}</div>
      </div>

      <div className="h-3 rounded-full bg-black/8">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${metric.progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay }}
          className="h-3 rounded-full bg-gradient-to-r from-[#111111] to-yellow-400"
        />
      </div>
    </div>
  );
}

export function PulseRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-sm text-white/70">{label}</div>
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-2.5 w-2.5 rounded-full bg-yellow-300"
        />
        <div className="text-sm font-black text-yellow-300">{value}</div>
      </div>
    </div>
  );
}

export function RatingCard({ title, value, subtitle }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-[1.5rem] border border-black/8 bg-[#f8f7f2] p-4"
    >
      <div className="text-sm font-medium text-black/50">{title}</div>
      <div className="mt-2 text-3xl font-black text-[#111111]">{value}</div>
      <div className="mt-1 text-sm text-black/48">{subtitle}</div>
    </motion.div>
  );
}

export function ProgressLine({ label, value, delay = 0 }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[#111111]">{label}</div>
        <div className="text-sm font-black text-[#111111]">{value}%</div>
      </div>
      <div className="h-3 rounded-full bg-black/8">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay }}
          className="h-3 rounded-full bg-gradient-to-r from-[#111111] to-yellow-400"
        />
      </div>
    </div>
  );
}

export function BottomMetric({ icon: Icon, title, value }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-[1.7rem] border border-black/8 bg-white/75 p-5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-200 text-black">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm font-medium text-black/48">{title}</div>
      <div className="mt-2 text-2xl font-black text-[#111111]">{value}</div>
    </motion.div>
  );
}