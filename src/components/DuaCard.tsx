import { motion } from "framer-motion";

interface DuaCardProps {
  title: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  index: number;
  color: string;
}

const DuaCard = ({ title, arabic, transliteration, meaning, index, color }: DuaCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-2xl p-5 sm:p-6 cursor-default"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-base sm:text-lg">{title}</h3>
        <span className="text-lg opacity-30">✦</span>
      </div>
      <p className="arabic-font text-right text-xl sm:text-2xl leading-relaxed mb-3 text-foreground/90">
        {arabic}
      </p>
      <p className="text-sm italic text-muted-foreground mb-2">{transliteration}</p>
      <p className="text-sm text-foreground/80">{meaning}</p>
    </motion.div>
  );
};

export default DuaCard;
