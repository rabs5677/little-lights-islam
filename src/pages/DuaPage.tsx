import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookHeart, Sparkles } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

const categories = [
  {
    title: "Daily Duas",
    description: "Essential duas for everyday life — waking up, eating, sleeping, and more.",
    icon: BookHeart,
    path: "/dua/daily",
    gradient: "from-[hsl(170,55%,42%)] to-[hsl(200,80%,60%)]",
    emoji: "🤲",
  },
  {
    title: "Additional Duas",
    description: "Powerful duas for forgiveness, protection, patience, guidance, and more.",
    icon: Sparkles,
    path: "/dua/additional",
    gradient: "from-[hsl(270,50%,65%)] to-[hsl(340,60%,75%)]",
    emoji: "✨",
  },
  {
    title: "Tasbeeh Counter",
    description: "Count your dhikr with a beautiful counter. Set targets and track your recitation.",
    icon: Sparkles,
    path: "/dua/tasbeeh",
    gradient: "from-[hsl(200,80%,55%)] to-[hsl(170,55%,42%)]",
    emoji: "📿",
  },
];

const DuaPage = () => {
  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-islamic mb-2">
            🤲 Dua Library
          </h1>
          <p className="text-muted-foreground">Beautiful supplications for every moment</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {categories.map((cat, i) => (
            <Link key={cat.path} to={cat.path}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${cat.gradient} text-primary-foreground shadow-xl cursor-pointer`}
              >
                <div className="text-4xl mb-4">{cat.emoji}</div>
                <h2 className="text-xl font-bold mb-2">{cat.title}</h2>
                <p className="text-sm opacity-90">{cat.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DuaPage;
