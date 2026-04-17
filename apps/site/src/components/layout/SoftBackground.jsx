import { motion } from "framer-motion";

export default function SoftBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-yellow-200/70 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-amber-100 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 18, 0], y: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-6rem] left-[20%] h-80 w-80 rounded-full bg-black/5 blur-3xl"
      />
    </div>
  );
}
