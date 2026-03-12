import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Target, Play, Trash2 } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

const SUGGESTIONS = [
  { text: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", benefit: "Helps in seeking forgiveness and purification of sins.", target: 100 },
  { text: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", benefit: "Increases remembrance of Allah and brings peace to the heart.", target: 100 },
  { text: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", benefit: "Builds gratitude and brings barakah.", target: 100 },
  { text: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", benefit: "Strengthens faith and humility.", target: 100 },
  { text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin", benefit: "Helpful in distress and difficult situations.", target: 33 },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", benefit: "A beloved dhikr with great rewards.", target: 100 },
  { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallahu wa ni'mal wakeel", benefit: "Gives comfort and trust in Allah in hardship.", target: 33 },
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

const TasbeehPage = () => {
  const savedSession = loadSavedSession();
  const [target, setTarget] = useState<number>(savedSession?.target || 0);
  const [dhikrName, setDhikrName] = useState(savedSession?.dhikrName || "");
  const [customTarget, setCustomTarget] = useState("");
  const [count, setCount] = useState(savedSession?.count || 0);
  const [completed, setCompleted] = useState(false);
  const [todayRecords, setTodayRecords] = useState<TasbeehSession[]>(loadTodayRecords);
  const [showContinueCard, setShowContinueCard] = useState(!!savedSession && savedSession.count > 0);

  const remaining = Math.max(0, target - count);
  const progress = target > 0 ? Math.min(100, (count / target) * 100) : 0;

  const totalToday = useMemo(() => todayRecords.reduce((sum, r) => sum + r.count, 0), [todayRecords]);

  // Persist active session
  useEffect(() => {
    if (target > 0 && !completed) {
      saveActiveSession({ dhikrName, target, count });
    }
  }, [count, target, dhikrName, completed]);

  const handleCount = useCallback(() => {
    if (completed) return;
    const next = count + 1;
    setCount(next);
    if (next >= target) {
      setCompleted(true);
      const session: TasbeehSession = { dhikrName: dhikrName || "Custom Dhikr", target, count: next, completed: true, timestamp: Date.now() };
      saveTodayRecord(session);
      setTodayRecords(loadTodayRecords());
      saveActiveSession(null);
    }
  }, [count, target, completed, dhikrName]);

  const reset = () => {
    // Save partial if count > 0
    if (count > 0 && !completed) {
      const session: TasbeehSession = { dhikrName: dhikrName || "Custom Dhikr", target, count, completed: false, timestamp: Date.now() };
      saveTodayRecord(session);
      setTodayRecords(loadTodayRecords());
    }
    setCount(0);
    setCompleted(false);
    saveActiveSession(null);
  };

  const startWithTarget = (t: number, name?: string) => {
    setTarget(t);
    setDhikrName(name || "");
    setCount(0);
    setCompleted(false);
    setShowContinueCard(false);
    saveActiveSession({ dhikrName: name || "", target: t, count: 0 });
  };

  const continueSession = () => {
    setShowContinueCard(false);
  };

  const newSession = () => {
    if (count > 0 && !completed) {
      const session: TasbeehSession = { dhikrName: dhikrName || "Custom Dhikr", target, count, completed: false, timestamp: Date.now() };
      saveTodayRecord(session);
      setTodayRecords(loadTodayRecords());
    }
    setTarget(0);
    setCount(0);
    setCompleted(false);
    setDhikrName("");
    setShowContinueCard(false);
    saveActiveSession(null);
  };

  const getMessage = () => {
    if (completed) return "MashaAllah! You made it! 🤲✨\nWell done! Keep your heart connected with Allah.";
    if (progress > 80) return NEAR_END[count % NEAR_END.length];
    return ENCOURAGEMENT[count % ENCOURAGEMENT.length];
  };

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
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[33, 100, 500, 1000].map((t) => (
                    <button key={t} onClick={() => startWithTarget(t)} className="glass-card rounded-xl py-3 font-bold text-lg hover:scale-105 active:scale-95 transition-transform">
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="number" value={customTarget} onChange={(e) => setCustomTarget(e.target.value)} placeholder="Custom..." className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => { const n = parseInt(customTarget); if (n > 0) startWithTarget(n); }} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">Start</button>
                </div>
              </div>

              {/* Quick start from suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-center text-muted-foreground">Quick Start</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.slice(0, 4).map((s) => (
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

        {/* Suggestions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10">
          <h2 className="font-bold text-lg mb-4 text-center">📿 Dhikr Suggestions & Benefits</h2>
          <div className="space-y-3">
            {SUGGESTIONS.map((s, i) => (
              <motion.div key={s.transliteration} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="arabic-font text-right text-lg sm:text-xl mb-1">{s.text}</p>
                    <p className="text-sm font-medium text-primary">{s.transliteration} — {s.target}×</p>
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
