import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingDecorations from "@/components/FloatingDecorations";
import logo from "@/assets/jannahpath-logo.png";

const sections = [
  { path: "/namaz", label: "Namaz Tracker", emoji: "🕌", color: "from-[hsl(170,55%,42%)] to-[hsl(160,60%,50%)]", glow: "shadow-[0_8px_30px_hsl(170,55%,42%,0.3)]" },
  { path: "/quran", label: "Quran", emoji: "📖", color: "from-[hsl(200,80%,55%)] to-[hsl(210,70%,60%)]", glow: "shadow-[0_8px_30px_hsl(200,80%,55%,0.3)]" },
  { path: "/dua", label: "Dua", emoji: "🤲", color: "from-[hsl(270,50%,60%)] to-[hsl(280,45%,65%)]", glow: "shadow-[0_8px_30px_hsl(270,50%,60%,0.3)]" },
  { path: "/learn", label: "Learn Islam", emoji: "🎓", color: "from-[hsl(45,90%,55%)] to-[hsl(35,85%,58%)]", glow: "shadow-[0_8px_30px_hsl(45,90%,55%,0.3)]" },
  { path: "/qibla", label: "Qibla", emoji: "🧭", color: "from-[hsl(160,45%,48%)] to-[hsl(175,50%,45%)]", glow: "shadow-[0_8px_30px_hsl(160,45%,48%,0.3)]" },
  { path: "/cycle", label: "Women Care", emoji: "💖", color: "from-[hsl(340,60%,65%)] to-[hsl(350,55%,70%)]", glow: "shadow-[0_8px_30px_hsl(340,60%,65%,0.3)]" },
  { path: "/tasbeeh", label: "Tasbeeh Counter", emoji: "📿", color: "from-[hsl(195,60%,50%)] to-[hsl(170,55%,45%)]", glow: "shadow-[0_8px_30px_hsl(195,60%,50%,0.3)]" },
];

const getRecentPage = (): { path: string; label: string } | null => {
  const saved = localStorage.getItem("jannahpath-recent-page");
  return saved ? JSON.parse(saved) : null;
};

const HomePage = () => {
  const [recent] = useState(getRecentPage);

  return (
    <div className="relative min-h-screen pb-10">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-lg">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 rounded-full bg-islamic-gold/20 blur-xl scale-150" />
            <img src={logo} alt="JannahPath" className="h-18 w-18 mx-auto object-contain relative z-10 drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-islamic">JannahPath</h1>
          <p className="text-sm text-muted-foreground mt-1">Your Islamic Companion ✨</p>
        </motion.div>

        {/* Recent page */}
        {recent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Link
              to={recent.path}
              className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform animate-glow-pulse"
            >
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm">▶</div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Continue where you left</p>
                <p className="text-sm font-semibold">{recent.label}</p>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {sections.map((s, i) => (
            <motion.div
              key={s.path}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.06 * i, type: "spring", stiffness: 200 }}
            >
              <Link
                to={s.path}
                className={`group block rounded-2xl bg-gradient-to-br ${s.color} ${s.glow} p-5 sm:p-6 text-white hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 relative overflow-hidden`}
              >
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700" />
                
                {/* Icon area */}
                <div className="relative z-10 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner group-hover:bg-white/30 transition-colors">
                    {s.emoji}
                  </div>
                </div>
                <p className="relative z-10 text-sm font-bold leading-tight drop-shadow-sm">{s.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          Created by Rabiya <span className="text-destructive">❤️</span>
        </motion.p>
      </div>
    </div>
  );
};

export default HomePage;
