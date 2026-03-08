import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import PrayerCard from "@/components/PrayerCard";
import PrayerProgress from "@/components/PrayerProgress";
import ProgressSoFar from "@/components/ProgressSoFar";
import FloatingDecorations from "@/components/FloatingDecorations";
import CelebrationBanner from "@/components/CelebrationBanner";
import HijabiReminder from "@/components/HijabiReminder";

const PRAYERS = [
  { name: "Fajr", time: "5:15 AM", color: "#5bb5a2" },
  { name: "Dhuhr", time: "12:30 PM", color: "#b39ddb" },
  { name: "Asr", time: "3:45 PM", color: "#81d4fa" },
  { name: "Maghrib", time: "6:20 PM", color: "#f48fb1" },
  { name: "Isha", time: "8:00 PM", color: "#ffd54f" },
];

const CELEBRATION_MESSAGES = [
  (name: string) => `MashaAllah! You completed ${name} 🌙`,
  (name: string) => `Beautiful! ${name} is done ✨`,
  (name: string) => `SubhanAllah! ${name} completed 💫`,
];

const getTodayKey = () => new Date().toISOString().split("T")[0];

const getHijriDate = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { calendar: "islamic-umalqura" as any, day: "numeric", month: "long", year: "numeric" };
  try {
    return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", options).format(today);
  } catch {
    return "";
  }
};

const Index = () => {
  const todayKey = getTodayKey();

  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("namaz-today");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayKey) return parsed.prayers;
    }
    return {};
  });

  const [history, setHistory] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem("namaz-history");
    return saved ? JSON.parse(saved) : {};
  });

  const [streak, setStreak] = useState(0);
  const [celebration, setCelebration] = useState<{ message: string; isFullDay: boolean } | null>(null);

  const completedCount = PRAYERS.filter((p) => completed[p.name]).length;

  // Time-based prayer detection
  const parseTime = (t: string) => {
    const [time, period] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  const getCurrentPrayerIndex = () => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let i = PRAYERS.length - 1; i >= 0; i--) {
      if (nowMin >= parseTime(PRAYERS[i].time)) return i;
    }
    return 0; // before Fajr, show Fajr
  };

  const currentIdx = getCurrentPrayerIndex();
  // Find current or next prayer based on time (not completion order)
  let nextPrayer: string | null = null;
  if (!completed[PRAYERS[currentIdx].name]) {
    nextPrayer = PRAYERS[currentIdx].name;
  } else {
    // Current is done, find next uncompleted from current onwards
    const future = PRAYERS.slice(currentIdx + 1).find((p) => !completed[p.name]);
    nextPrayer = future?.name ?? null;
  }

  // Find missed (Qaza) prayers: before current time and not completed
  const missedPrayers = PRAYERS.slice(0, currentIdx).filter((p) => !completed[p.name]).map((p) => p.name);

  useEffect(() => {
    localStorage.setItem("namaz-today", JSON.stringify({ date: todayKey, prayers: completed }));
    const newHistory = { ...history, [todayKey]: completed };
    setHistory(newHistory);
    localStorage.setItem("namaz-history", JSON.stringify(newHistory));

    // Calculate streak
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split("T")[0];
      const dayPrayers = newHistory[key];
      if (dayPrayers && PRAYERS.every((p) => dayPrayers[p.name])) {
        s++;
        d.setDate(d.getDate() - 1);
      } else if (key === todayKey) {
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(s);
  }, [completed]);

  const togglePrayer = (name: string) => {
    const wasCompleted = completed[name];
    const newCompleted = { ...completed, [name]: !wasCompleted };
    setCompleted(newCompleted);

    if (!wasCompleted) {
      const newCount = PRAYERS.filter((p) => newCompleted[p.name]).length;
      if (newCount === 5) {
        setCelebration({
          message: "Alhamdulillah! You completed all 5 prayers today 🤲✨",
          isFullDay: true,
        });
      } else {
        const msgFn = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
        setCelebration({ message: msgFn(name), isFullDay: false });
      }
    }
  };

  const hideCelebration = useCallback(() => setCelebration(null), []);

  const hijri = getHijriDate();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <CelebrationBanner
        message={celebration?.message ?? ""}
        visible={!!celebration}
        onHide={hideCelebration}
        isFullDay={celebration?.isFullDay}
      />
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-islamic mb-2">
            ☪ Namaz Tracker
          </h1>
          <p className="text-muted-foreground">{today}</p>
          {hijri && <p className="text-sm text-islamic-gold font-medium mt-1">{hijri}</p>}
        </motion.div>

        {/* Hijabi Reminder */}
        <HijabiReminder nextPrayer={nextPrayer} missedPrayers={missedPrayers} />

        {/* Progress ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6 mb-8"
        >
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(var(--islamic-gold))"
                strokeWidth="8"
                strokeLinecap="round"
                initial={false}
                animate={{ strokeDasharray: `${(completedCount / 5) * 264} 264` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={completedCount}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold"
              >
                {completedCount}/5
              </motion.span>
            </div>
          </div>
          {streak > 0 && (
            <div className="glass-card rounded-2xl px-5 py-3 flex items-center gap-2 animate-glow-pulse">
              <Flame className="text-islamic-gold" size={22} />
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="font-bold text-lg">{streak} day{streak > 1 ? "s" : ""}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Prayer Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto mb-8">
          {PRAYERS.map((prayer, i) => (
            <PrayerCard
              key={prayer.name}
              name={prayer.name}
              time={prayer.time}
              completed={!!completed[prayer.name]}
              onToggle={() => togglePrayer(prayer.name)}
              index={i}
              color={prayer.color}
              isNext={prayer.name === nextPrayer}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="max-w-3xl mx-auto">
          <PrayerProgress history={history} />
        </div>
      </div>
    </div>
  );
};

export default Index;
