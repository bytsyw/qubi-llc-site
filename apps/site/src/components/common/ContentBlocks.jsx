import { motion } from "framer-motion";

export function TinyFeature({ icon: Icon, label }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[1.3rem] border border-black/8 bg-[#f8f7f2] p-4"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-200 text-black">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-sm font-semibold text-[#111111]">{label}</div>
    </motion.div>
  );
}

export function UsageStep({ index, text }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-start gap-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow-300 font-black text-black">
        {index}
      </div>
      <div className="pt-1 text-sm leading-6 text-white/75">{text}</div>
    </motion.div>
  );
}

export function ScreenshotCard({ title, dark = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -6 }}
      className="rounded-[1.7rem] border border-black/8 bg-[#f8f7f2] p-4"
    >
      <div
        className={`relative overflow-hidden rounded-[1.4rem] ${
          dark
            ? "bg-[linear-gradient(180deg,#111111_0%,#2a2a2a_50%,#facc15_100%)]"
            : "bg-[linear-gradient(180deg,#fff8df_0%,#ffe48e_50%,#facc15_100%)]"
        } p-4`}
      >
        <div className="mb-3 text-sm font-bold text-black/75">{title}</div>
        <div className="h-36 rounded-[1.2rem] bg-white/45 backdrop-blur-sm" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-10 rounded-xl bg-black/10" />
          <div className="h-10 rounded-xl bg-black/10" />
          <div className="h-10 rounded-xl bg-black/10" />
        </div>
      </div>
    </motion.div>
  );
}

export function InfoPanel({ icon: Icon, title, items, light = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className={`rounded-[2rem] border p-6 shadow-[0_16px_45px_rgba(0,0,0,0.05)] ${
        light
          ? "border-black/8 bg-white/80 text-[#111111]"
          : "border-black/8 bg-[#111111] text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            light ? "bg-yellow-100 text-black" : "bg-yellow-300 text-black"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div
            className={`text-sm font-semibold ${light ? "text-black/48" : "text-white/45"}`}
          >
            Information block
          </div>
          <h3 className="text-xl font-black">{title}</h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className={`rounded-[1.3rem] border px-4 py-3 text-sm leading-6 ${
              light
                ? "border-black/8 bg-[#f8f7f2] text-black/68"
                : "border-white/10 bg-white/5 text-white/72"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
