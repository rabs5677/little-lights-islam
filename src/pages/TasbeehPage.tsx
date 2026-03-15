import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Target, Play, Trophy, Star } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

const SUGGESTIONS = [
  { text: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", meaning: "I seek forgiveness from Allah", benefit: "Purifies the heart and erases sins. The Prophet ﷺ used to seek forgiveness 100 times a day.", target: 100 },
  { text: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", meaning: "Glory be to Allah", benefit: "A plant in Jannah is planted for you with every recitation.", target: 100 },
  { text: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", meaning: "All praise is for Allah", benefit: "Fills the scales of good deeds on the Day of Judgment.", target: 100 },
  { text: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", meaning: "Allah is the Greatest", benefit: "Beloved to Allah and a means of elevation in ranks.", target: 100 },
  { text: "لَا إِلَهَ إِلَّا اللَّهُ", transliteration: "La ilaha illa Allah", meaning: "There is no god but Allah", benefit: "The best dhikr and the key to Paradise.", target: 100 },
  { text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin", meaning: "None has the right to be worshipped but You, Glorified are You. Indeed, I have been of the wrongdoers.", benefit: "Dua of Prophet Yunus (AS) – relieves distress and hardship.", target: 33 },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", meaning: "Glory and praise be to Allah", benefit: "Sins fall away like leaves, even if as many as the foam of the sea.", target: 100 },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", transliteration: "SubhanAllahi wa bihamdihi, SubhanAllahil Azeem", meaning: "Glory and praise be to Allah, Glory be to Allah the Almighty", benefit: "Two phrases light on the tongue, heavy on the scales, beloved to Ar-Rahman.", target: 100 },
  { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallahu wa ni'mal wakeel", meaning: "Allah is sufficient for us and the best disposer of affairs", benefit: "Said by Ibrahim (AS) when thrown in fire. Brings trust and comfort.", target: 33 },
  { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", meaning: "There is no power or strength except with Allah", benefit: "A treasure from the treasures of Paradise.", target: 100 },
];

const ENCOURAGEMENT = [
  "Keep going, Allah loves consistency 💚",
  "You're doing great! 🌙",
  "Every count matters ✨",
  "SubhanAllah, keep it up! 🤲",
];

const NEAR_END = [
  "Almost there! You can do it! 🎉",
  "Just a few more! 💫",
  "MashaAllah, nearly done! ✨",
];

const MILESTONES = [100, 200, 300, 500, 1000];

interface TasbeehSession {
  dhikrName: string;
  target: number;
  count: number;
  completed: boolean;
  timestamp: number;
}

interface SavedSession {
  dhikrName: string;
  target: number;
  count: number;
}

interface Achievement {
  dhikrName: string;
  count: number;
  date: string;
}

const getTodayKey = () => new Date().toISOString().split("T")[0];

const loadTodayRecords = (): TasbeehSession[] => {
  const saved = localStorage.getItem("tasbeeh-records");
  if (!saved) return [];
  const all: Record<string, TasbeehSession[]> = JSON.parse(saved);
  return all[getTodayKey()] || [];
};

const saveTodayRecord = (session: TasbeehSession) => {
  const saved = localStorage.getItem("tasbeeh-records");
  const all: Record<string, TasbeehSession[]> = saved ? JSON.parse(saved) : {};
  const today = getTodayKey();
  if (!all[today]) all[today] = [];
  all[today].push(session);
  localStorage.setItem("tasbeeh-records", JSON.stringify(all));
};

const loadSavedSession = (): SavedSession | null => {
  const saved = localStorage.getItem("tasbeeh-active-session");
  return saved ? JSON.parse(saved) : null;
};

const saveActiveSession = (s: SavedSession | null) => {
  if (s) localStorage.setItem("tasbeeh-active-session", JSON.stringify(s));
  else localStorage.removeItem("tasbeeh-active-session");
};

const loadAchievements = (): Achievement[] => {
  const saved = localStorage.getItem("tasbeeh-achievements");
  return saved ? JSON.parse(saved) : [];
};

const saveAchievement = (a: Achievement) => {
  const all = loadAchievements();
  all.push(a);
  localStorage.setItem("tasbeeh-achievements", JSON.stringify(all));
};

const TasbeehPage = () => {
  const savedSession = loadSavedSession();
  const [target, setTarget] = useState<number>(savedSession?.target || 0);
  const [dhikrName, setDhikrName] = useState(savedSession?.dhikrName || "");
  const [customTarget, setCustomTarget] = useState("");
  const [customDhikrName, setCustomDhikrName] = useState("");
  const [count, setCount] = useState(savedSession?.count || 0);
  const [completed, setCompleted] = useState(false);
  const [todayRecords, setTodayRecords] = useState<TasbeehSession[]>(loadTodayRecords);
  const [showContinueCard, setShowContinueCard] = useState(!!savedSession && savedSession.count > 0);
  const [achievements] = useState<Achievement[]>(loadAchievements);

  const remaining = Math.max(0, target - count);
  const progress = target > 0 ? Math.min(100, (count / target) * 100) : 0;
  const totalToday = useMemo(() => todayRecords.reduce((sum, r) => sum + r.count, 0), [todayRecords]);

  useEffect(() => {
    if (target > 0 && !completed) {
      saveActiveSession({ dhikrName, target, count });
    }
  }, [count, target, dhikrName, completed]);

  const checkMilestones = useCallback((name: string, finalCount: number) => {
    const todayKey = getTodayKey();
    const existing = loadAchievements();
    for (const m of MILESTONES) {
      if (finalCount >= m && !existing.some((a) => a.dhikrName === name && a.count === m && a.date === todayKey)) {
        saveAchievement({ dhikrName: name, count: m, date: todayKey });
      }
    }
  }, []);

  const handleCount = useCallback(() => {
    if (completed) return;
    const next = count + 1;
    setCount(next);
    if (next >= target) {
      setCompleted(true);
      const name = dhikrName || "Custom Dhikr";
      const session: TasbeehSession = { dhikrName: name, target, count: next, completed: true, timestamp: Date.now() };
      saveTodayRecord(session);
      setTodayRecords(loadTodayRecords());
      saveActiveSession(null);
      checkMilestones(name, next);
    }
  }, [count, target, completed, dhikrName, checkMilestones]);

  const reset = () => {
    if (count > 0 && !completed) {
      const name = dhikrName || "Custom Dhikr";
      const session: TasbeehSession = { dhikrName: name, target, count, completed: false, timestamp: Date.now() };
      saveTodayRecord(session);
      setTodayRecords(loadTodayRecords());
      checkMilestones(name, count);
    }
    setCount(0);
    setCompleted(false);
    saveActiveSession(null);
  };

  const startWithTarget = (t: number, name?: string) => {
    setTarget(t);
    setDhikrName(name || customDhikrName || "");
    setCount(0);
    setCompleted(false);
    setShowContinueCard(false);
    saveActiveSession({ dhikrName: name || customDhikrName || "", target: t, count: 0 });
  };

  const continueSession = () => setShowContinueCard(false);

  const newSession = () => {
    if (count > 0 && !completed) {
      const name = dhikrName || "Custom Dhikr";
      const session: TasbeehSession = { dhikrName: name, target, count, completed: false, timestamp: Date.now() };
      saveTodayRecord(session);
      setTodayRecords(loadTodayRecords());
    }
    setTarget(0);
    setCount(0);
    setCompleted(false);
    setDhikrName("");
    setCustomDhikrName("");
    setShowContinueCard(false);
    saveActiveSession(null);
  };

  const getMessage = () => {
    if (completed) return "MashaAllah! You made it! 🤲✨\nWell done! Keep your heart connected with Allah.";
    if (progress > 80) return NEAR_END[count % NEAR_END.length];
    return ENCOURAGEMENT[count % ENCOURAGEMENT.length];
  };

  const todayAchievements = useMemo(() => {
    const todayKey = getTodayKey();
    return achievements.filter((a) => a.date === todayKey);
  }, [achievements]);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
        <Link to="/dua" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Dua</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">📿 Tasbeeh Counter</h1>
          <p className="text-muted-foreground">Count your dhikr with peace and focus</p>
        </motion.div>

        {/* Continue card */}
        {showContinueCard && target > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 mb-6">
            <p className="font-semibold text-sm mb-1">🔄 Continue from where you left</p>
            <p className="text-xs text-muted-foreground mb-3">{dhikrName || "Custom Dhikr"} — {count}/{target}</p>
            <div className="flex gap-2">
              <button onClick={continueSession} className="flex-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5">
                <Play size={14} /> Continue
              </button>
              <button onClick={newSession} className="px-3 py-2 rounded-xl glass-card text-sm font-medium">New</button>
            </div>
          </motion.div>
        )}

        {target === 0 || showContinueCard ? (
          !showContinueCard && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card rounded-2xl p-6 text-center">
                <Target className="mx-auto mb-3 text-islamic-gold" size={32} />
                <h2 className="font-bold text-lg mb-4">Set Your Target</h2>

                {/* Dhikr name input */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={customDhikrName}
                    onChange={(e) => setCustomDhikrName(e.target.value)}
                    placeholder="Enter dhikr name (e.g. Astaghfirullah)"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring text-center"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[33, 100, 500, 1000].map((t) => (
                    <button key={t} onClick={() => startWithTarget(t)} className="glass-card rounded-xl py-3 font-bold text-lg hover:scale-105 active:scale-95 transition-transform">
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="number" value={customTarget} onChange={(e) => setCustomTarget(e.target.value)} placeholder="Custom count..." className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => { const n = parseInt(customTarget); if (n > 0) startWithTarget(n); }} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">Start</button>
                </div>
              </div>

              {/* Quick start */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-center text-muted-foreground">Quick Start</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.slice(0, 6).map((s) => (
                    <button key={s.transliteration} onClick={() => startWithTarget(s.target, s.transliteration)} className="glass-card rounded-xl p-3 text-left hover:scale-[1.02] active:scale-[0.98] transition-transform">
                      <p className="text-xs font-medium">{s.transliteration}</p>
                      <p className="text-[10px] text-muted-foreground">{s.target}×</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        ) : (
          <div className="space-y-6">
            {/* Animated boy */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-end gap-3 max-w-sm mx-auto">
              <div className="flex-shrink-0">
                <svg width="52" height="68" viewBox="0 0 52 68" fill="none" className="drop-shadow-md">
                  <ellipse cx="26" cy="10" rx="12" ry="6" fill="hsl(var(--primary))" />
                  <rect x="14" y="10" width="24" height="4" rx="2" fill="hsl(var(--primary))" />
                  <circle cx="26" cy="20" r="10" fill="hsl(40 40% 88%)" />
                  <path d="M12 34 C12 28 40 28 40 34 L42 64 C42 66 10 66 10 64 Z" fill="hsl(var(--primary))" />
                  <ellipse cx="14" cy="46" rx="4" ry="3" fill="hsl(40 40% 86%)" />
                  <ellipse cx="38" cy="46" rx="4" ry="3" fill="hsl(40 40% 86%)" />
                </svg>
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-center text-islamic-gold text-xs -mt-1">✦</motion.div>
              </div>
              <motion.div key={count} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card rounded-2xl rounded-bl-sm px-4 py-3 border border-primary/20 shadow-md relative">
                <p className="text-sm font-quicksand font-medium whitespace-pre-line leading-relaxed">{getMessage()}</p>
                <div className="absolute bottom-3 -left-2 w-3 h-3 border-l border-b border-primary/20 rotate-45 glass-card" />
              </motion.div>
            </motion.div>

            {/* Dhikr name badge */}
            {dhikrName && (
              <div className="text-center">
                <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{dhikrName}</span>
              </div>
            )}

            {/* Counter circle */}
            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                {completed && (
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl mb-4">🎉✨🤲</motion.div>
                )}
              </AnimatePresence>

              <motion.button onClick={handleCount} disabled={completed} whileTap={{ scale: 0.92 }} className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center shadow-xl transition-all ${completed ? "glow-gold" : "glass-card hover:shadow-2xl active:shadow-inner"}`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <motion.circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--islamic-gold))" strokeWidth="4" strokeLinecap="round" initial={false} animate={{ strokeDasharray: `${(progress / 100) * 283} 283` }} transition={{ duration: 0.3 }} />
                </svg>
                <div className="text-center z-10">
                  <motion.span key={count} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-4xl sm:text-5xl font-bold block">{count}</motion.span>
                  <span className="text-xs text-muted-foreground block mt-1">of {target}</span>
                </div>
              </motion.button>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-muted-foreground">{remaining} remaining</span>
                <button onClick={reset} className="p-2 rounded-xl glass-card hover:scale-105 transition-transform" title="Reset">
                  <RotateCcw size={16} />
                </button>
                <button onClick={newSession} className="text-xs text-muted-foreground underline">New session</button>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {todayAchievements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h2 className="font-bold text-lg mb-3 text-center flex items-center justify-center gap-2">
              <Trophy size={18} className="text-islamic-gold" /> Dhikr Milestones
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {todayAchievements.map((a, i) => (
                <div key={i} className="glass-card rounded-xl p-3 text-center">
                  <Star size={16} className="text-islamic-gold mx-auto mb-1" />
                  <p className="text-xs font-bold">{a.count}×</p>
                  <p className="text-[10px] text-muted-foreground truncate">{a.dhikrName}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Today's Record */}
        {todayRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
            <h2 className="font-bold text-lg mb-3 text-center">🕌 Today's Dhikr Activity</h2>
            <div className="glass-card rounded-2xl p-4 space-y-2">
              {todayRecords.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.dhikrName}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{r.count}<span className="text-muted-foreground font-normal">/{r.target}</span></p>
                    {r.completed && <span className="text-[10px] text-primary">✓ Complete</span>}
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <p className="text-sm font-medium text-islamic-gold">MashaAllah, you remembered Allah {totalToday} times today ✨</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggestions with full details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10">
          <h2 className="font-bold text-lg mb-4 text-center">📿 Dhikr Suggestions & Benefits</h2>
          <div className="space-y-3">
            {SUGGESTIONS.map((s, i) => (
              <motion.div key={s.transliteration} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="arabic-font text-right text-lg sm:text-xl mb-1">{s.text}</p>
                    <p className="text-sm font-medium text-primary">{s.transliteration} — {s.target}×</p>
                    <p className="text-xs text-muted-foreground mt-0.5 italic">{s.meaning}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.benefit}</p>
                  </div>
                  <button onClick={() => startWithTarget(s.target, s.transliteration)} className="flex-shrink-0 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Start this dhikr">
                    <Play size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TasbeehPage;
