import { motion } from "framer-motion";

export function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      className={`rounded-[2rem] border border-black/8 bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ text }) {
  return (
    <div className="rounded-full border border-black/8 bg-[#f6f4ee] px-4 py-2 text-sm font-medium text-black/68">
      {text}
    </div>
  );
}
