import { motion, AnimatePresence } from "framer-motion";
import { isDateInCycle } from "@/pages/CycleTracker";

interface HijabiReminderProps {
  nextPrayer: string | null;
  missedPrayers?: string[];
}

const CYCLE_MESSAGES = [
  "Take rest 🤍 Don't forget Astaghfaar and Tasbeeh.",
  "These are days of rest. Stay connected through dhikr and duas. 💕",
  "Rest easy 🌸 Your heart can still worship through dhikr.",
];

const HijabiReminder = ({ nextPrayer, missedPrayers = [] }: HijabiReminderProps) => {
  const todayKey = new Date().toISOString().split("T")[0];
  const inCycle = isDateInCycle(todayKey);

  if (inCycle) {
    const msg = CYCLE_MESSAGES[new Date().getDate() % CYCLE_MESSAGES.length];
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-end gap-3 max-w-sm mx-auto mb-6"
        >
          <div className="flex-shrink-0 relative">
            <svg width="56" height="72" viewBox="0 0 56 72" fill="none" className="drop-shadow-md">
              <ellipse cx="28" cy="24" rx="18" ry="20" fill="hsl(var(--islamic-pink))" />
              <ellipse cx="28" cy="22" rx="14" ry="16" fill="hsl(var(--islamic-peach))" />
              <circle cx="28" cy="20" r="10" fill="hsl(40 40% 90%)" />
              <path d="M14 38 C14 32 42 32 42 38 L44 68 C44 70 12 70 12 68 Z" fill="hsl(var(--islamic-pink))" />
              <ellipse cx="16" cy="48" rx="4" ry="3" fill="hsl(40 40% 88%)" />
              <ellipse cx="40" cy="48" rx="4" ry="3" fill="hsl(40 40% 88%)" />
            </svg>
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-1 left-1/2 -translate-x-1/2 text-islamic-pink text-xs">🌸</motion.div>
          </div>
          <motion.div className="relative glass-card rounded-2xl rounded-bl-sm px-4 py-3 border border-islamic-pink/30 shadow-md">
            <p className="text-sm font-quicksand font-medium whitespace-pre-line leading-relaxed">{msg}</p>
            <div className="absolute bottom-3 -left-2 w-3 h-3 bg-white/70 border-l border-b border-islamic-pink/30 rotate-45" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!nextPrayer && missedPrayers.length === 0) return null;

  const mainMessages = nextPrayer
    ? [
        `Don't forget to pray ${nextPrayer} 🌙\nWe're cheering for you!`,
        `You're doing great!\nLet's continue with ${nextPrayer}.`,
        `Keep going! ${nextPrayer} is next 💫`,
      ]
    : [`MashaAllah! All prayers done ✨`];
  const mainMsg = mainMessages[(nextPrayer?.length ?? 0) % mainMessages.length];
  const qazaMsg = missedPrayers.length > 0 ? `\nDon't forget Qaza for ${missedPrayers.join(", ")}.` : "";

  return (
    <AnimatePresence>
      <motion.div
        key={nextPrayer}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex items-end gap-3 max-w-sm mx-auto mb-6"
      >
        <div className="flex-shrink-0 relative">
          <svg width="56" height="72" viewBox="0 0 56 72" fill="none" className="drop-shadow-md">
            <ellipse cx="28" cy="24" rx="18" ry="20" fill="hsl(var(--islamic-pink))" />
            <ellipse cx="28" cy="22" rx="14" ry="16" fill="hsl(var(--islamic-peach))" />
            <circle cx="28" cy="20" r="10" fill="hsl(40 40% 90%)" />
            <path d="M14 38 C14 32 42 32 42 38 L44 68 C44 70 12 70 12 68 Z" fill="hsl(var(--islamic-pink))" />
            <ellipse cx="16" cy="48" rx="4" ry="3" fill="hsl(40 40% 88%)" />
            <ellipse cx="40" cy="48" rx="4" ry="3" fill="hsl(40 40% 88%)" />
          </svg>
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-1 left-1/2 -translate-x-1/2 text-islamic-gold text-xs">✦</motion.div>
        </div>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative glass-card rounded-2xl rounded-bl-sm px-4 py-3 border border-islamic-pink/30 shadow-md">
          <p className="text-sm font-quicksand font-medium whitespace-pre-line leading-relaxed">{mainMsg + qazaMsg}</p>
          <div className="absolute bottom-3 -left-2 w-3 h-3 bg-white/70 border-l border-b border-islamic-pink/30 rotate-45" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HijabiReminder;
