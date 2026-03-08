import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PrayerCardProps {
  name: string;
  time: string;
  completed: boolean;
  onToggle: () => void;
  index: number;
  color: string;
}

const PrayerCard = ({ name, time, completed, onToggle, index, color }: PrayerCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onToggle}
      className={`relative cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-500 ${
        completed
          ? "glow-gold scale-[1.02]"
          : "glass-card hover:scale-[1.02]"
      }`}
      style={{
        background: completed
          ? `linear-gradient(135deg, ${color}40, ${color}20)`
          : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-muted-foreground text-sm">{time}</p>
        </div>
        <motion.div
          whileTap={{ scale: 0.8 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            completed
              ? "bg-islamic-gold text-primary-foreground shadow-lg"
              : "border-2 border-border bg-background"
          }`}
        >
          {completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Check size={20} />
            </motion.div>
          )}
        </motion.div>
      </div>
      {/* Decorative pattern */}
      <div className="absolute top-2 right-14 text-xs opacity-20">✦</div>
    </motion.div>
  );
};

export default PrayerCard;
