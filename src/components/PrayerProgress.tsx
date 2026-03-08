import { motion } from "framer-motion";

interface PrayerProgressProps {
  history: Record<string, Record<string, boolean>>;
}

const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const colors = ["#5bb5a2", "#b39ddb", "#81d4fa", "#f48fb1", "#ffd54f"];

const PrayerProgress = ({ history }: PrayerProgressProps) => {
  const days = Object.keys(history).sort().slice(-7);

  if (days.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-lg mb-2">📊 Prayer Progress</h3>
        <p className="text-muted-foreground text-sm">Start tracking to see your progress here!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-5"
    >
      <h3 className="font-bold text-lg mb-4">📊 Weekly Progress</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          {/* Header - dates */}
          <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
            <div />
            {days.map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground">
                {new Date(day).toLocaleDateString("en", { weekday: "short" })}
              </div>
            ))}
          </div>
          {/* Prayer rows */}
          {prayers.map((prayer, pi) => (
            <div
              key={prayer}
              className="grid gap-1 mb-1"
              style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
            >
              <div className="text-xs font-medium flex items-center">{prayer}</div>
              {days.map((day) => {
                const done = history[day]?.[prayer] || false;
                return (
                  <div
                    key={day}
                    className="aspect-square rounded-md max-w-[28px] mx-auto transition-all duration-300"
                    style={{
                      backgroundColor: done ? colors[pi] : "hsl(var(--muted))",
                      opacity: done ? 1 : 0.4,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PrayerProgress;
