import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, ChevronLeft, ChevronRight, Calendar, MapPin, Clock } from "lucide-react";
import PrayerCard from "@/components/PrayerCard";
import PrayerProgress from "@/components/PrayerProgress";
import ProgressSoFar from "@/components/ProgressSoFar";
import FloatingDecorations from "@/components/FloatingDecorations";
import CelebrationBanner from "@/components/CelebrationBanner";
import HijabiReminder from "@/components/HijabiReminder";
import { isDateInCycle } from "@/pages/CycleTracker";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const PRAYERS = [
  { name: "Fajr", color: "#5bb5a2" },
  { name: "Dhuhr", color: "#b39ddb" },
  { name: "Asr", color: "#81d4fa" },
  { name: "Maghrib", color: "#f48fb1" },
  { name: "Isha", color: "#ffd54f" },
];

const CELEBRATION_MESSAGES = [
  (name: string) => `MashaAllah! You completed ${name} 🌙`,
  (name: string) => `Beautiful! ${name} is done ✨`,
  (name: string) => `SubhanAllah! ${name} completed 💫`,
];

const getDateKey = (d: Date) => d.toISOString().split("T")[0];
const getTodayKey = () => getDateKey(new Date());

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
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const isToday = selectedDate === todayKey;
  const todayInCycle = isDateInCycle(todayKey);
  const { times, city, nextPrayerCountdown, nextPrayerName: apiNextPrayer } = usePrayerTimes();

  const prayerTimes = useMemo(() => {
    if (!times) return PRAYERS.map((p) => ({ ...p, time: "" }));
    return PRAYERS.map((p) => ({
      ...p,
      time: times[p.name as keyof typeof times] || "",
    }));
  }, [times]);

  const [history, setHistory] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem("namaz-history");
    return saved ? JSON.parse(saved) : {};
  });

  const completed = history[selectedDate] || {};
  const [streak, setStreak] = useState(0);
  const [celebration, setCelebration] = useState<{ message: string; isFullDay: boolean } | null>(null);

  const completedCount = PRAYERS.filter((p) => completed[p.name]).length;

  // Next prayer based on API times
  const nextPrayer = useMemo(() => {
    if (!isToday || todayInCycle) return null;
    return apiNextPrayer && !completed[apiNextPrayer] ? apiNextPrayer : null;
  }, [isToday, completed, todayInCycle, apiNextPrayer]);

  const missedPrayers = useMemo(() => {
    if (!isToday || todayInCycle || !times) return [];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return PRAYERS.filter((p) => {
      const [h, m] = (times[p.name as keyof typeof times] || "0:0").split(":").map(Number);
      return (h * 60 + m) < nowMin && !completed[p.name];
    }).map((p) => p.name);
  }, [isToday, completed, todayInCycle, times]);

  // Streak
  useEffect(() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const key = getDateKey(d);
      if (isDateInCycle(key)) { d.setDate(d.getDate() - 1); continue; }
      const dayPrayers = history[key];
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
  }, [history, todayKey]);

  useEffect(() => {
    localStorage.setItem("namaz-history", JSON.stringify(history));
  }, [history]);

  const togglePrayer = (name: string) => {
    const wasCompleted = completed[name];
    const newDayPrayers = { ...completed, [name]: !wasCompleted };
    setHistory({ ...history, [selectedDate]: newDayPrayers });

    if (!wasCompleted) {
      const newCount = PRAYERS.filter((p) => newDayPrayers[p.name]).length;
      if (newCount === 5) {
        setCelebration({ message: "Alhamdulillah! You completed all 5 prayers today 🤲✨", isFullDay: true });
      } else {
        const msgFn = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
        setCelebration({ message: msgFn(name), isFullDay: false });
      }
    }
  };

  const hideCelebration = useCallback(() => setCelebration(null), []);

  const goDate = (dir: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + dir);
    if (d <= new Date()) setSelectedDate(getDateKey(d));
  };

  const handleDateClick = (dateKey: string) => setSelectedDate(dateKey);

  const selectedDateObj = new Date(selectedDate + "T12:00:00");
  const displayDate = selectedDateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const hijri = getHijriDate();
  const selectedInCycle = isDateInCycle(selectedDate);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <CelebrationBanner message={celebration?.message ?? ""} visible={!!celebration} onHide={hideCelebration} isFullDay={celebration?.isFullDay} />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-islamic mb-1">☪ Namaz Tracker</h1>
          {isToday && hijri && <p className="text-sm text-islamic-gold font-medium">{hijri}</p>}
        </motion.div>

        {/* Location & Next Prayer Banner */}
        {isToday && times && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-4 flex-wrap mb-4">
            {city && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} /> {city}
              </span>
            )}
            {apiNextPrayer && (
              <span className="flex items-center gap-1.5 text-xs font-medium bg-islamic-gold/15 text-foreground px-3 py-1.5 rounded-full">
                <Clock size={12} className="text-islamic-gold" />
                {apiNextPrayer} in {nextPrayerCountdown}
              </span>
            )}
          </motion.div>
        )}

        {/* Date Navigator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button onClick={() => goDate(-1)} className="p-2 rounded-xl glass-card hover:scale-105 transition-transform active:scale-95">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSelectedDate(todayKey)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isToday ? "bg-primary text-primary-foreground shadow-md" : "glass-card"}`}
          >
            <Calendar size={14} />
            <span className="max-w-[200px] truncate">{isToday ? "Today" : displayDate}</span>
          </button>
          <button onClick={() => goDate(1)} disabled={isToday} className="p-2 rounded-xl glass-card hover:scale-105 transition-transform disabled:opacity-30 active:scale-95">
            <ChevronRight size={18} />
          </button>
        </div>

        {!isToday && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-4">
            <span className="inline-block bg-accent/20 text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full">
              📅 Editing {displayDate} — Mark Qaza prayers
            </span>
          </motion.div>
        )}

        {selectedInCycle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-4">
            <span className="inline-block bg-islamic-pink/20 text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
              🌸 Cycle period — prayers paused, streak preserved
            </span>
          </motion.div>
        )}

        {isToday && <HijabiReminder nextPrayer={nextPrayer} missedPrayers={missedPrayers} />}

        {/* Progress ring */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-6 mb-8">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--islamic-gold))" strokeWidth="8" strokeLinecap="round" initial={false} animate={{ strokeDasharray: `${(completedCount / 5) * 264} 264` }} transition={{ duration: 0.7, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span key={completedCount} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-2xl font-bold">{completedCount}/5</motion.span>
            </div>
          </div>
          {streak > 0 && isToday && (
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
          {prayerTimes.map((prayer, i) => (
            <PrayerCard
              key={prayer.name}
              name={prayer.name}
              time={prayer.time}
              completed={!!completed[prayer.name]}
              onToggle={() => togglePrayer(prayer.name)}
              index={i}
              color={prayer.color}
              isNext={isToday && prayer.name === nextPrayer}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="max-w-3xl mx-auto space-y-6">
          <PrayerProgress history={history} />
          <ProgressSoFar history={history} onDateClick={handleDateClick} />
        </div>
      </div>
    </div>
  );
};

export default Index;
