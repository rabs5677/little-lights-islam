import { motion } from "framer-motion";

interface JuzCardProps {
  number: number;
  arabicName: string;
  englishName: string;
  isBookmarked: boolean;
  onClick: () => void;
  index: number;
}

const JuzCard = ({ number, arabicName, englishName, isBookmarked, onClick, index }: JuzCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 ${
        isBookmarked ? "glow-gold" : "glass-card"
      }`}
      style={{
        background: isBookmarked
          ? "linear-gradient(135deg, hsl(45 90% 55% / 0.15), hsl(45 90% 55% / 0.05))"
          : undefined,
      }}
    >
      {/* Decorative circle border */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full border-2 border-islamic-gold/40 flex items-center justify-center bg-islamic-cream">
        <span className="font-bold text-lg sm:text-xl text-foreground">{number}</span>
      </div>
      <p className="arabic-font text-lg mb-1">{arabicName}</p>
      <p className="text-xs text-muted-foreground">{englishName}</p>
      {isBookmarked && (
        <div className="absolute top-2 right-2 text-islamic-gold text-sm">🔖</div>
      )}
    </motion.div>
  );
};

export default JuzCard;
