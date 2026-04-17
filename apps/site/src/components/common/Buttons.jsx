import { motion } from "framer-motion";

export function ButtonPrimary({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-3.5 text-sm font-bold text-yellow-300 shadow-[0_16px_45px_rgba(0,0,0,0.14)]"
    >
      {children}
    </motion.button>
  );
}

export function ButtonSecondary({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/75 px-6 py-3.5 text-sm font-semibold text-black shadow-sm"
    >
      {children}
    </motion.button>
  );
}
