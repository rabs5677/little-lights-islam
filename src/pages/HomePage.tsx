import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Compass, Heart, GraduationCap, Navigation, Moon as MoonIcon, Timer } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";
import logo from "@/assets/jannahpath-logo.png";
import { getXP, getLevel, getStreaks, getAchievements, getRandomEncouragement } from "@/lib/gamification";

const sections = [
  { path: "/namaz", label: "Namaz Tracker", icon: MoonIcon, gradient: "from-[hsl(170,60%,40%)] via-[hsl(180,55%,45%)] to-[hsl(190,50%,50%)]", borderGlow: "hsl(175,60%,50%)" },
  { path: "/quran", label: "Quran", icon: BookOpen, gradient: "from-[hsl(210,70%,45%)] via-[hsl(220,65%,50%)] to-[hsl(240,60%,55%)]", borderGlow: "hsl(220,70%,55%)" },
  { path: "/dua", label: "Dua", icon: Heart, gradient: "from-[hsl(270,55%,50%)] via-[hsl(280,50%,55%)] to-[hsl(300,45%,55%)]", borderGlow: "hsl(280,55%,55%)" },
  { path: "/learn", label: "Learn Islam", icon: GraduationCap, gradient: "from-[hsl(40,80%,50%)] via-[hsl(45,85%,55%)] to-[hsl(50,75%,55%)]", borderGlow: "hsl(45,85%,55%)" },
  { path: "/qibla", label: "Qibla", icon: Navigation, gradient: "from-[hsl(150,50%,40%)] via-[hsl(160,55%,45%)] to-[hsl(170,50%,48%)]", borderGlow: "hsl(160,55%,45%)" },
  { path: "/cycle", label: "Women Care", icon: Heart, gradient: "from-[hsl(330,55%,55%)] via-[hsl(340,60%,60%)] to-[hsl(350,55%,60%)]", borderGlow: "hsl(340,60%,60%)" },
  { path: "/tasbeeh", label: "Tasbeeh Counter", icon: Timer, gradient: "from-[hsl(190,55%,45%)] via-[hsl(200,60%,50%)] to-[hsl(210,55%,52%)]", borderGlow: "hsl(200,60%,50%)" },
];

const getRecentPage = (): { path: string; label: string } | null => {
  const saved = localStorage.getItem("jannahpath-recent-page");
  return saved ? JSON.parse(saved) : null;
};

const HomePage = () => {
  const [recent] = useState(getRecentPage);
  const [encouragement] = useState(getRandomEncouragement);
  const xp = getXP();
  const levelInfo = getLevel(xp);
  const streaks = getStreaks();
  const achievements = getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const maxStreak = Math.max(streaks.quran, streaks.dhikr, streaks.namaz);

  return (
    <div className="relative min-h-screen pb-10">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5"
        >
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 rounded-full blur-2xl scale-[2] opacity-40" style={{ background: "radial-gradient(circle, hsl(45,90%,55%), hsl(170,55%,42%), transparent)" }} />
            <img src={logo} alt="JannahPath" className="h-20 w-20 mx-auto object-contain relative z-10 drop-shadow-lg rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-islamic">JannahPath</h1>
          <p className="text-sm text-muted-foreground mt-1">Your Islamic Companion ✨</p>
        </motion.div>

        {/* XP & Streak Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <div>
                <p className="text-xs font-bold">Level {levelInfo.level} — {levelInfo.title}</p>
                <p className="text-[10px] text-muted-foreground">{xp} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {maxStreak > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-sm">🔥</span>
                  <span className="text-xs font-bold">{maxStreak}</span>
                </div>
              )}
              {unlockedCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-sm">🏅</span>
                  <span className="text-xs font-bold">{unlockedCount}</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-center italic">{encouragement}</p>
        </motion.div>

        {/* Recent page */}
        {recent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Link
              to={recent.path}
              className="relative block rounded-2xl p-[2px] overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
              style={{ background: "linear-gradient(135deg, hsl(170,60%,50%), hsl(220,70%,55%), hsl(280,55%,55%), hsl(340,60%,55%))" }}
            >
              <div className="glass-card rounded-[14px] px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm">▶</div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Continue where you left</p>
                  <p className="text-sm font-semibold">{recent.label}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Dashboard Grid — Neon Glow Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.path}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.08 * i, type: "spring", stiffness: 180, damping: 18 }}
              >
                <Link
                  to={s.path}
                  className="neon-card group block relative rounded-2xl p-[2px] overflow-hidden hover:scale-[1.04] active:scale-[0.95] transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${s.borderGlow}, hsl(220,70%,55%), hsl(280,55%,55%), hsl(340,55%,55%))`,
                  }}
                >
                  {/* Outer glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-70 transition-opacity blur-md" style={{ background: `linear-gradient(135deg, ${s.borderGlow}, hsl(280,55%,55%))` }} />

                  {/* Card inner */}
                  <div className="relative rounded-[14px] bg-card dark:bg-[hsl(220,25%,12%)] p-5 sm:p-6 h-full flex flex-col items-center justify-center text-center gap-3 min-h-[130px]">
                    {/* Centered glowing icon */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `linear-gradient(135deg, ${s.borderGlow}33, ${s.borderGlow}15)` }}
                    >
                      <div className="absolute inset-0 rounded-full opacity-50 blur-lg group-hover:opacity-80 transition-opacity" style={{ background: s.borderGlow }} />
                      <Icon size={26} className="relative z-10 text-foreground" />
                    </div>
                    <p className="text-sm font-bold leading-tight">{s.label}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Achievements Preview */}
        {unlockedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-4 mt-6"
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">Achievements</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {achievements.filter(a => a.unlocked).map(a => (
                <span key={a.id} className="text-2xl" title={a.label}>{a.icon}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-10 relative"
        >
          <span className="relative">
            Created by Rabiya <span className="text-destructive">❤️</span>
            <span className="absolute inset-0 blur-lg opacity-30 bg-destructive rounded-full" />
          </span>
        </motion.p>
      </div>
    </div>
  );
};

export default HomePage;
