import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Heart, Droplets } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FloatingDecorations from "@/components/FloatingDecorations";

export interface CycleEntry {
  startDate: string;
  endDate: string;
}

export const getCycleEntries = (): CycleEntry[] => {
  const saved = localStorage.getItem("cycle-entries");
  return saved ? JSON.parse(saved) : [];
};

export const isDateInCycle = (dateKey: string): boolean => {
  const entries = getCycleEntries();
  return entries.some((e) => dateKey >= e.startDate && dateKey <= e.endDate);
};

const CycleTracker = () => {
  const [entries, setEntries] = useState<CycleEntry[]>(getCycleEntries);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    localStorage.setItem("cycle-entries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!startDate || !endDate) return;
    const sKey = startDate.toISOString().split("T")[0];
    const eKey = endDate.toISOString().split("T")[0];
    if (sKey > eKey) return;
    setEntries([...entries, { startDate: sKey, endDate: eKey }]);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const removeEntry = (i: number) => {
    setEntries(entries.filter((_, idx) => idx !== i));
  };

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplets className="text-islamic-pink" size={28} />
            <h1 className="text-3xl font-bold text-gradient-islamic">Women's Care</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Track your menstrual cycle dates. During these days, your prayer streak will pause — not break. 💕
          </p>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 mb-6 border-l-4"
          style={{ borderLeftColor: "hsl(var(--islamic-pink))" }}
        >
          <div className="flex items-start gap-3">
            <Heart className="text-islamic-pink flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground mb-1">How it works</p>
              <p>Add your cycle dates below. During these days:</p>
              <ul className="list-disc ml-4 mt-1 space-y-0.5">
                <li>Prayers won't be expected</li>
                <li>Your streak won't break — it pauses</li>
                <li>The reminder will encourage dhikr and duas instead</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Add entry */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="font-bold mb-4">Add Cycle Dates</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={addEntry} disabled={!startDate || !endDate} className="w-full">
            Add Cycle Period
          </Button>
        </div>

        {/* Entries */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold">Saved Periods</h3>
            {entries.map((entry, i) => (
              <motion.div
                key={`${entry.startDate}-${entry.endDate}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Droplets size={16} className="text-islamic-pink" />
                  <span className="text-sm font-medium">
                    {new Date(entry.startDate + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                    {" — "}
                    {new Date(entry.endDate + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <button
                  onClick={() => removeEntry(i)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleTracker;
