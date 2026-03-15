import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2 } from "lucide-react";

interface Props {
  prayerName: string;
  visible: boolean;
  onDismiss: () => void;
}

const PrayerAlertBanner = ({ prayerName, visible, onDismiss }: Props) => (
  <AnimatePresence>
    {visible && prayerName && (
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        className="fixed top-16 left-0 right-0 z-[60] flex justify-center px-4 pt-2"
      >
        <div className="glass-card rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl border border-islamic-gold/30 max-w-md w-full">
          <div className="w-10 h-10 rounded-full bg-islamic-gold/20 flex items-center justify-center flex-shrink-0">
            <Volume2 size={18} className="text-islamic-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">It's time for {prayerName} 🌙</p>
            <p className="text-xs text-muted-foreground">May Allah accept your prayer</p>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PrayerAlertBanner;
