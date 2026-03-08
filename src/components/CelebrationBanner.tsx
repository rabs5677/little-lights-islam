import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface CelebrationBannerProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  isFullDay?: boolean;
}

const sparkles = ["✦", "✧", "☆", "✨", "🌙"];

const CelebrationBanner = ({ message, visible, onHide, isFullDay }: CelebrationBannerProps) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, isFullDay ? 4000 : 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide, isFullDay]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={`relative glass-card rounded-2xl px-6 py-3 shadow-xl border ${
              isFullDay
                ? "border-islamic-gold/40 glow-gold"
                : "border-islamic-mint/40 glow-primary"
            }`}
          >
            {/* Floating sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-islamic-gold pointer-events-none"
                style={{
                  top: `${-10 + Math.random() * 20}px`,
                  left: `${10 + (i / 6) * 80}%`,
                  fontSize: `${10 + Math.random() * 8}px`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-5, -25],
                  x: [0, (Math.random() - 0.5) * 20],
                }}
                transition={{ duration: 1.5, delay: i * 0.15 }}
              >
                {sparkles[i % sparkles.length]}
              </motion.span>
            ))}
            <p className={`font-quicksand font-semibold text-center ${isFullDay ? "text-base" : "text-sm"}`}>
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationBanner;
