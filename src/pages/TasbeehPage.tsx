import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Target, Play, Pause, Trophy, Star, Plus, Trash2, Coins } from "lucide-react";
import confetti from "canvas-confetti";
import FloatingDecorations from "@/components/FloatingDecorations";
import {
  addXP,
  recordActivity,
  checkDhikrAchievements,
  addCoins,
  getCoins,
  getCustomDhikr,
  addCustomDhikr,
  removeCustomDhikr,
  type CustomDhikr,
} from "@/lib/gamification";

const SUGGESTIONS = [
  { text: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", meaning: "I seek forgiveness from Allah", benefit: "Purifies the heart and erases sins.", target: 100 },
  { text: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", meaning: "Glory be to Allah", benefit: "A plant in Jannah is planted for you.", target: 100 },
  { text: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", meaning: "All praise is for Allah", benefit: "Fills the scales of good deeds.", target: 100 },
  { text: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", meaning: "Allah is the Greatest", benefit: "Beloved to Allah, elevation in ranks.", target: 100 },
  { text: "لَا إِلَهَ إِلَّا اللَّهُ", transliteration: "La ilaha illa Allah", meaning: "There is no god but Allah", benefit: "The best dhikr and key to Paradise.", target: 100 },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", meaning: "Glory and praise be to Allah", benefit: "Sins fall away like leaves.", target: 100 },
  { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", meaning: "No power except with Allah", benefit: "A treasure from treasures of Paradise.", target: 100 },
  { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallahu wa ni'mal wakeel", meaning: "Allah is sufficient for us", benefit: "Brings trust and comfort.", target: 33 },
];

const ENCOURAGEMENT = ["Keep going, Allah loves consistency 💚", "You're doing great! 🌙", "Every count matters ✨", "SubhanAllah, keep it up! 🤲"];
const NEAR_END = ["Almost there! 🎉", "Just a few more! 💫", "MashaAllah, nearly done! ✨"];
const MILESTONES = [100, 200, 300, 500, 1000];

// Glowing color cycle for the progress ring
const RING_COLORS = [
  "hsl(48, 95%, 55%)",   // yellow
  "hsl(140, 65%, 45%)",  // green
  "hsl(210, 80%, 55%)",  // blue
  "hsl(275, 70%, 55%)",  // purple
  "hsl(330, 75%, 60%)",  // pink
  "hsl(25, 60%, 45%)",   // brown
];

interface ActiveSession {
  id: string;
  dhikrName: string;
  target: number;
  count: number;
  status: "active" | "paused" | "completed";
  createdAt: number;
}

interface TasbeehRecord {
  dhikrName: string;
  target: number;
  count: number;
  completed: boolean;
  timestamp: number;
}

interface Achievement {
  dhikrName: string;
  count: number;
  date: string;
}

const getTodayKey = () => new Date().toISOString().split("T")[0];
const genId = () => Math.random().toString(36).slice(2, 10);

const loadSessions = (): ActiveSession[] => {
  const saved = localStorage.getItem("tasbeeh-sessions");
  return saved ? JSON.parse(saved) : [];
};
const saveSessions = (s: ActiveSession[]) => localStorage.setItem("tasbeeh-sessions", JSON.stringify(s));

const loadTodayRecords = (): TasbeehRecord[] => {
  const saved = localStorage.getItem("tasbeeh-records");
  if (!saved) return [];
  const all: Record<string, TasbeehRecord[]> = JSON.parse(saved);
  return all[getTodayKey()] || [];
};
const saveTodayRecord = (r: TasbeehRecord) => {
  const saved = localStorage.getItem("tasbeeh-records");
  const all: Record<string, TasbeehRecord[]> = saved ? JSON.parse(saved) : {};
  const today = getTodayKey();
  if (!all[today]) all[today] = [];
  all[today].push(r);
  localStorage.setItem("tasbeeh-records", JSON.stringify(all));
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
  const [sessions, setSessions] = useState<ActiveSession[]>(loadSessions);
  const [activeId, setActiveId] = useState<string | null>(() => {
    const s = loadSessions();
    return s.find(x => x.status === "active")?.id || null;
  });
  const [todayRecords, setTodayRecords] = useState<TasbeehRecord[]>(loadTodayRecords);
  const [customDhikrName, setCustomDhikrName] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [customDhikrList, setCustomDhikrList] = useState<CustomDhikr[]>(getCustomDhikr);

  // Add custom dhikr modal state
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [newTarget, setNewTarget] = useState("100");

  // Live coin counter
  const [coins, setCoins] = useState<number>(getCoins);
  const [showReward, setShowReward] = useState<{ amount: number; message: string } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeSession = sessions.find(s => s.id === activeId);
  const pausedSessions = sessions.filter(s => s.status === "paused");
  const totalToday = useMemo(() => todayRecords.reduce((sum, r) => sum + r.count, 0), [todayRecords]);
  const todayAchievements = useMemo(() => {
    const k = getTodayKey();
    return loadAchievements().filter(a => a.date === k);
  }, [todayRecords]);

  useEffect(() => { saveSessions(sessions); }, [sessions]);

  // Color of the progress ring based on count
  const ringColor = activeSession ? RING_COLORS[activeSession.count % RING_COLORS.length] : RING_COLORS[0];

  const startSession = (target: number, name?: string) => {
    const updated = sessions.map(s => s.status === "active" ? { ...s, status: "paused" as const } : s);
    const newSession: ActiveSession = { id: genId(), dhikrName: name || customDhikrName || "Custom Dhikr", target, count: 0, status: "active", createdAt: Date.now() };
    setSessions([...updated, newSession]);
    setActiveId(newSession.id);
    setCustomDhikrName("");
    setCustomTarget("");
  };

  const resumeSession = (id: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) return { ...s, status: "active" as const };
      if (s.status === "active") return { ...s, status: "paused" as const };
      return s;
    }));
    setActiveId(id);
  };

  const pauseSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "paused" as const } : s));
    setActiveId(null);
  };

  const checkMilestones = (name: string, c: number) => {
    const todayKey = getTodayKey();
    const existing = loadAchievements();
    for (const m of MILESTONES) {
      if (c >= m && !existing.some(a => a.dhikrName === name && a.count === m && a.date === todayKey)) {
        saveAchievement({ dhikrName: name, count: m, date: todayKey });
      }
    }
    checkDhikrAchievements(c);
  };

  const fireConfetti = () => {
    const colors = ["#facc15", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors, scalar: 0.9 });
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.6 }, colors, scalar: 0.7 }), 200);
  };

  const handleCount = useCallback(() => {
    if (!activeSession || activeSession.status !== "active") return;
    const next = activeSession.count + 1;
    const completed = next >= activeSession.target;
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, count: next, status: completed ? "completed" as const : "active" as const } : s));

    // +1 coin per dhikr
    setCoins(addCoins(1));

    if (completed) {
      saveTodayRecord({ dhikrName: activeSession.dhikrName, target: activeSession.target, count: next, completed: true, timestamp: Date.now() });
      setTodayRecords(loadTodayRecords());
      checkMilestones(activeSession.dhikrName, next);
      addXP(5);
      recordActivity("dhikr");
      fireConfetti();
      setShowReward({ amount: next, message: "MashaAllah! Session complete 🎉" });
      setTimeout(() => setShowReward(null), 2400);
      setTimeout(() => {
        setSessions(prev => prev.filter(s => s.id !== activeSession.id));
        setActiveId(null);
      }, 2200);
    } else if (next % 100 === 0) {
      // Bonus reward popup every 100
      setShowReward({ amount: 100, message: `+100 dhikr 🪙 ${next} total` });
      setTimeout(() => setShowReward(null), 1500);
    }
  }, [activeSession]);

  const resetSession = (id: string) => {
    const s = sessions.find(x => x.id === id);
    if (s && s.count > 0) {
      saveTodayRecord({ dhikrName: s.dhikrName, target: s.target, count: s.count, completed: false, timestamp: Date.now() });
      setTodayRecords(loadTodayRecords());
      checkMilestones(s.dhikrName, s.count);
      addXP(Math.floor(s.count / 10));
      recordActivity("dhikr");
    }
    setSessions(prev => prev.filter(x => x.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleAddCustomDhikr = () => {
    const name = newName.trim();
    const t = parseInt(newTarget, 10);
    if (!name || !t || t <= 0) return;
    const item = addCustomDhikr({ name, arabic: newArabic.trim() || undefined, target: t });
    setCustomDhikrList((prev) => [...prev, item]);
    setNewName(""); setNewArabic(""); setNewTarget("100");
    setAddOpen(false);
  };

  const handleDeleteCustom = (id: string) => {
    removeCustomDhikr(id);
    setCustomDhikrList(getCustomDhikr());
  };

  const progress = activeSession ? Math.min(100, (activeSession.count / activeSession.target) * 100) : 0;
  const remaining = activeSession ? Math.max(0, activeSession.target - activeSession.count) : 0;
  const isCompleted = activeSession?.status === "completed";

  const getMessage = () => {
    if (isCompleted) return "MashaAllah! You made it! 🤲✨";
    if (progress > 80) return NEAR_END[((activeSession?.count || 0)) % NEAR_END.length];
    return ENCOURAGEMENT[((activeSession?.count || 0)) % ENCOURAGEMENT.length];
  };

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />

      {/* Coin counter — top right floating */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 right-4 z-30 glass-card rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md border border-islamic-gold/30"
        style={{ boxShadow: "0 0 16px hsl(45, 90%, 55% / 0.25)" }}
      >
        <Coins size={14} className="text-islamic-gold" />
        <motion.span key={coins} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-xs font-bold tabular-nums">
          {coins.toLocaleString()}
        </motion.span>
      </motion.div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">📿 Tasbeeh Counter</h1>
          <p className="text-muted-foreground text-sm">Each dhikr earns 1 coin 🪙</p>
        </motion.div>

        {/* Reward popup */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-40 glass-card rounded-2xl px-5 py-3 shadow-xl border border-islamic-gold/40"
              style={{ boxShadow: "0 0 28px hsl(45, 90%, 55% / 0.4)" }}
            >
              <p className="text-sm font-bold text-center">{showReward.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paused Sessions */}
        {pausedSessions.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paused Sessions</p>
            {pausedSessions.map(s => (
              <div key={s.id} className="glass-card rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.dhikrName}</p>
                  <p className="text-xs text-muted-foreground">{s.count}/{s.target}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => resumeSession(s.id)} className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                    <Play size={12} /> Continue
                  </button>
                  <button onClick={() => resetSession(s.id)} className="p-1.5 rounded-xl glass-card text-muted-foreground hover:text-destructive" title="Remove">
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active counting view */}
        {activeSession && activeSession.status === "active" && (
          <div className="space-y-6 mb-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-3 text-center">
              <p className="text-sm font-medium">{getMessage()}</p>
            </motion.div>

            <div className="text-center">
              <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{activeSession.dhikrName}</span>
            </div>

            <div className="flex flex-col items-center">
              {isCompleted && (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl mb-4">🎉✨🤲</motion.div>
              )}
              <motion.button
                ref={buttonRef}
                onClick={handleCount}
                disabled={isCompleted}
                whileTap={{ scale: 0.92 }}
                animate={{ boxShadow: `0 0 32px ${ringColor}55, 0 0 64px ${ringColor}33` }}
                transition={{ duration: 0.3 }}
                className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center transition-all bg-card border border-border`}
                style={{ boxShadow: `0 0 32px ${ringColor}55, 0 0 64px ${ringColor}33` }}
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <motion.circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={ringColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ strokeDasharray: `${(progress / 100) * 283} 283` }}
                    transition={{ duration: 0.3 }}
                    style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }}
                  />
                </svg>
                <div className="text-center z-10">
                  <motion.span key={activeSession.count} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-4xl sm:text-5xl font-bold block">{activeSession.count}</motion.span>
                  <span className="text-xs text-muted-foreground block mt-1">of {activeSession.target}</span>
                </div>
              </motion.button>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-muted-foreground">{remaining} remaining</span>
                <button onClick={() => pauseSession(activeSession.id)} className="px-3 py-1.5 rounded-xl glass-card text-xs font-medium flex items-center gap-1">
                  <Pause size={12} /> Pause
                </button>
              </div>
            </div>
          </div>
        )}

        {/* START NEW DHIKR — Always visible */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mb-8">
          <div className="glass-card rounded-2xl p-6 text-center">
            <Target className="mx-auto mb-3 text-islamic-gold" size={32} />
            <h2 className="font-bold text-lg mb-4">Start New Dhikr</h2>
            <div className="mb-4">
              <input type="text" value={customDhikrName} onChange={e => setCustomDhikrName(e.target.value)} placeholder="Dhikr name (e.g. Astaghfirullah)" className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring text-center" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[33, 100, 500, 1000].map(t => (
                <button key={t} onClick={() => startSession(t)} className="glass-card rounded-xl py-3 font-bold text-lg hover:scale-105 active:scale-95 transition-transform">{t}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="number" value={customTarget} onChange={e => setCustomTarget(e.target.value)} placeholder="Custom count..." className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={() => { const n = parseInt(customTarget); if (n > 0) startSession(n); }} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm">Start</button>
            </div>
          </div>

          {/* Quick start */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Quick Start</p>
              <button
                onClick={() => setAddOpen((o) => !o)}
                className="text-xs font-medium text-primary flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Add Custom Dhikr
              </button>
            </div>

            {/* Add custom form */}
            <AnimatePresence>
              {addOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-card rounded-2xl p-4 space-y-2">
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (e.g. Durood Sharif)" maxLength={50} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm" />
                    <input value={newArabic} onChange={(e) => setNewArabic(e.target.value)} placeholder="Arabic text (optional)" maxLength={200} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm arabic-font text-right" dir="rtl" />
                    <div className="flex gap-2">
                      <input type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} min={1} max={100000} placeholder="Target count" className="flex-1 px-3 py-2 rounded-lg bg-background border border-input text-sm" />
                      <button onClick={handleAddCustomDhikr} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Save</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.slice(0, 6).map(s => (
                <button key={s.transliteration} onClick={() => startSession(s.target, s.transliteration)} className="glass-card rounded-xl p-3 text-left hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  <p className="text-xs font-medium">{s.transliteration}</p>
                  <p className="text-[10px] text-muted-foreground">{s.target}×</p>
                </button>
              ))}
              {customDhikrList.map((d) => (
                <div key={d.id} className="glass-card rounded-xl p-3 text-left flex flex-col gap-1 group relative border border-primary/20">
                  <button onClick={() => startSession(d.target, d.name)} className="text-left">
                    <p className="text-xs font-medium truncate">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.target}× · custom</p>
                  </button>
                  <button
                    onClick={() => handleDeleteCustom(d.id)}
                    className="absolute top-1 right-1 p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete custom dhikr"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

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

        {/* Suggestions */}
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
                  <button onClick={() => startSession(s.target, s.transliteration)} className="flex-shrink-0 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Start">
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
