import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const COLORS = ["#5bb5a2", "#b39ddb", "#81d4fa", "#f48fb1", "#ffd54f"];

interface ProgressSoFarProps {
  history: Record<string, Record<string, boolean>>;
}

const getWeekDates = (offset: number): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d.toISOString().split("T")[0];
  });
};

const getMonthDates = (offset: number): string[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + offset;
  const d = new Date(year, month, 1);
  const dates: string[] = [];
  while (d.getMonth() === new Date(year, month, 1).getMonth()) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
};

const ProgressSoFar = ({ history }: ProgressSoFarProps) => {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [offset, setOffset] = useState(0);

  const dates = useMemo(() => {
    return view === "weekly" ? getWeekDates(offset) : getMonthDates(offset);
  }, [view, offset]);

  const periodLabel = useMemo(() => {
    if (dates.length === 0) return "";
    const first = new Date(dates[0]);
    const last = new Date(dates[dates.length - 1]);
    if (view === "weekly") {
      return `${first.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return first.toLocaleDateString("en", { month: "long", year: "numeric" });
  }, [dates, view]);

  const todayKey = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    let completed = 0;
    let total = 0;
    dates.forEach((d) => {
      PRAYERS.forEach((p) => {
        total++;
        if (history[d]?.[p]) completed++;
      });
    });
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [dates, history]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-islamic-gold" size={20} />
          <h3 className="font-bold text-lg">Progress So Far</h3>
        </div>
        {/* View tabs */}
        <div className="flex bg-muted rounded-xl p-0.5 text-xs font-medium">
          <button
            onClick={() => { setView("weekly"); setOffset(0); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${view === "weekly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => { setView("monthly"); setOffset(0); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${view === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Period navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-muted-foreground">{periodLabel}</span>
        <button
          onClick={() => setOffset(o => Math.min(0, o + 1))}
          disabled={offset >= 0}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #5bb5a2, #ffd54f)" }}
            initial={false}
            animate={{ width: `${stats.pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
          {stats.completed}/{stats.total} ({stats.pct}%)
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${offset}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="min-w-[320px]"
          >
            {/* Day headers */}
            <div
              className="grid gap-[3px] mb-1"
              style={{ gridTemplateColumns: `60px repeat(${dates.length}, 1fr)` }}
            >
              <div />
              {dates.map((d) => {
                const dt = new Date(d);
                const isToday = d === todayKey;
                return (
                  <div key={d} className={`text-center text-[10px] leading-tight ${isToday ? "text-islamic-gold font-bold" : "text-muted-foreground"}`}>
                    {view === "weekly" ? (
                      <>
                        <div>{dt.toLocaleDateString("en", { weekday: "short" })}</div>
                        <div>{dt.getDate()}</div>
                      </>
                    ) : (
                      <div>{dt.getDate()}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Prayer rows */}
            {PRAYERS.map((prayer, pi) => (
              <div
                key={prayer}
                className="grid gap-[3px] mb-[3px]"
                style={{ gridTemplateColumns: `60px repeat(${dates.length}, 1fr)` }}
              >
                <div className="text-[11px] font-medium flex items-center">{prayer}</div>
                {dates.map((d) => {
                  const done = history[d]?.[prayer] || false;
                  return (
                    <motion.div
                      key={d}
                      initial={false}
                      animate={{
                        backgroundColor: done ? COLORS[pi] : "hsl(var(--muted))",
                        opacity: done ? 1 : 0.3,
                        scale: done ? 1 : 0.85,
                      }}
                      transition={{ duration: 0.3 }}
                      className="aspect-square rounded-[4px] max-w-[24px] mx-auto"
                      title={`${prayer} - ${new Date(d).toLocaleDateString()}`}
                    />
                  );
                })}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProgressSoFar;
