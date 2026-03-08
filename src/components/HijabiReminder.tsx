import { motion, AnimatePresence } from "framer-motion";

interface HijabiReminderProps {
  nextPrayer: string | null;
}

const HijabiReminder = ({ nextPrayer }: HijabiReminderProps) => {
  if (!nextPrayer) return null;

  const messages = [
    `Don't forget to pray ${nextPrayer} 🌙\nWe're cheering for you!`,
    `You're doing great!\nLet's continue with ${nextPrayer}.`,
    `Keep going! ${nextPrayer} is next 💫`,
  ];
  const message = messages[nextPrayer.length % messages.length];

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
        {/* Hijabi character - simple silhouette */}
        <div className="flex-shrink-0 relative">
          <svg width="56" height="72" viewBox="0 0 56 72" fill="none" className="drop-shadow-md">
            {/* Hijab */}
            <ellipse cx="28" cy="24" rx="18" ry="20" fill="hsl(var(--islamic-pink))" />
            <ellipse cx="28" cy="22" rx="14" ry="16" fill="hsl(var(--islamic-peach))" />
            {/* Face area - no features */}
            <circle cx="28" cy="20" r="10" fill="hsl(40 40% 90%)" />
            {/* Body / dress */}
            <path d="M14 38 C14 32 42 32 42 38 L44 68 C44 70 12 70 12 68 Z" fill="hsl(var(--islamic-pink))" />
            {/* Arms holding sign */}
            <ellipse cx="16" cy="48" rx="4" ry="3" fill="hsl(40 40% 88%)" />
            <ellipse cx="40" cy="48" rx="4" ry="3" fill="hsl(40 40% 88%)" />
          </svg>
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1 left-1/2 -translate-x-1/2 text-islamic-gold text-xs"
          >
            ✦
          </motion.div>
        </div>

        {/* Speech bubble / board */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative glass-card rounded-2xl rounded-bl-sm px-4 py-3 border border-islamic-pink/30 shadow-md"
        >
          <p className="text-sm font-quicksand font-medium text-foreground whitespace-pre-line leading-relaxed">
            {message}
          </p>
          {/* Little triangle pointing to character */}
          <div className="absolute bottom-3 -left-2 w-3 h-3 bg-white/70 border-l border-b border-islamic-pink/30 rotate-45" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HijabiReminder;
