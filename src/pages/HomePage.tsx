import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Compass, HandHeart, GraduationCap, Droplets, Heart } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";
import logo from "@/assets/jannahpath-logo.png";

const sections = [
  { path: "/namaz", label: "Namaz Tracker", icon: "☪", color: "from-[hsl(170,55%,42%)] to-[hsl(170,45%,55%)]" },
  { path: "/quran", label: "Quran", icon: "📖", color: "from-[hsl(200,80%,55%)] to-[hsl(200,60%,65%)]" },
  { path: "/dua", label: "Dua", icon: "🤲", color: "from-[hsl(270,50%,65%)] to-[hsl(270,40%,75%)]" },
  { path: "/learn", label: "Learn Islam", icon: "🎓", color: "from-[hsl(45,90%,55%)] to-[hsl(35,80%,60%)]" },
  { path: "/qibla", label: "Qibla", icon: "🧭", color: "from-[hsl(160,40%,50%)] to-[hsl(170,55%,42%)]" },
  { path: "/cycle", label: "Women Care", icon: "💧", color: "from-[hsl(340,60%,70%)] to-[hsl(340,50%,80%)]" },
  { path: "/tasbeeh", label: "Tasbeeh Counter", icon: "📿", color: "from-[hsl(200,60%,55%)] to-[hsl(170,55%,42%)]" },
];

const getRecentPage = (): { path: string; label: string } | null => {
  const saved = localStorage.getItem("jannahpath-recent-page");
  return saved ? JSON.parse(saved) : null;
};

const HomePage = () => {
  const [recent, setRecent] = useState(getRecentPage);

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
          <img src={logo} alt="JannahPath" className="h-16 w-16 mx-auto mb-2 object-contain" />
          <h1 className="text-3xl font-bold text-gradient-islamic">JannahPath</h1>
          <p className="text-sm text-muted-foreground mt-1">Your Islamic Companion</p>
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
              className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm">▶</div>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link
                to={s.path}
                className={`block rounded-2xl bg-gradient-to-br ${s.color} p-5 sm:p-6 text-white shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-transform`}
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-sm font-bold leading-tight">{s.label}</p>
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
