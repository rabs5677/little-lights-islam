import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays, addDays } from "date-fns";
import { CalendarIcon, Heart, Droplets, Edit2, Trash2, TrendingUp, Sparkles, Save, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FloatingDecorations from "@/components/FloatingDecorations";
import CycleGuidance from "@/components/CycleGuidance";

export interface CycleEntry {
  id: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

const STORAGE_KEY = "cycle-entries";

const genId = () => Math.random().toString(36).slice(2, 10);

// Migrate legacy entries (without id)
const loadEntries = (): CycleEntry[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  const arr = JSON.parse(saved);
  return arr.map((e: any) => ({ id: e.id || genId(), startDate: e.startDate, endDate: e.endDate, notes: e.notes || "" }));
};

export const getCycleEntries = (): CycleEntry[] => loadEntries();

export const isDateInCycle = (dateKey: string): boolean => {
  return getCycleEntries().some((e) => dateKey >= e.startDate && dateKey <= e.endDate);
};

const isTodayInCycle = (): boolean => {
  const today = new Date().toISOString().split("T")[0];
  return isDateInCycle(today);
};

const toKey = (d: Date) => d.toISOString().split("T")[0];

const CycleTracker = () => {
  const [entries, setEntries] = useState<CycleEntry[]>(loadEntries);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<Date | undefined>();
  const [editEnd, setEditEnd] = useState<Date | undefined>();
  const [editNotes, setEditNotes] = useState("");

  // Calendar view state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const todayActive = isTodayInCycle();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!startDate || !endDate) return;
    const sKey = toKey(startDate);
    const eKey = toKey(endDate);
    if (sKey > eKey) return;
    setEntries([...entries, { id: genId(), startDate: sKey, endDate: eKey, notes: notes.trim() || undefined }]);
    setStartDate(undefined); setEndDate(undefined); setNotes("");
  };

  const removeEntry = (id: string) => setEntries(entries.filter((e) => e.id !== id));

  const startEdit = (e: CycleEntry) => {
    setEditingId(e.id);
    setEditStart(new Date(e.startDate + "T12:00:00"));
    setEditEnd(new Date(e.endDate + "T12:00:00"));
    setEditNotes(e.notes || "");
  };

  const saveEdit = () => {
    if (!editingId || !editStart || !editEnd) return;
    const sKey = toKey(editStart);
    const eKey = toKey(editEnd);
    if (sKey > eKey) return;
    setEntries(entries.map((e) => e.id === editingId ? { ...e, startDate: sKey, endDate: eKey, notes: editNotes.trim() || undefined } : e));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  // Predictions
  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [entries]
  );

  const stats = useMemo(() => {
    if (sortedEntries.length === 0) return null;
    // Average period length
    const lengths = sortedEntries.map((e) =>
      differenceInDays(new Date(e.endDate + "T12:00:00"), new Date(e.startDate + "T12:00:00")) + 1
    );
    const avgPeriodLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);

    // Average cycle length (start to start)
    let avgCycleLength = 28;
    if (sortedEntries.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < sortedEntries.length; i++) {
        const g = differenceInDays(
          new Date(sortedEntries[i].startDate + "T12:00:00"),
          new Date(sortedEntries[i - 1].startDate + "T12:00:00")
        );
        if (g > 0 && g < 90) gaps.push(g);
      }
      if (gaps.length) avgCycleLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }

    const last = sortedEntries[sortedEntries.length - 1];
    const lastStart = new Date(last.startDate + "T12:00:00");
    const nextStart = addDays(lastStart, avgCycleLength);
    const nextEnd = addDays(nextStart, Math.max(avgPeriodLength - 1, 0));

    return {
      avgPeriodLength,
      avgCycleLength,
      nextStart,
      nextEnd,
      totalCycles: sortedEntries.length,
    };
  }, [sortedEntries]);

  // Build calendar modifiers
  const pastDates: Date[] = [];
  const currentDates: Date[] = [];
  const todayKey = toKey(new Date());
  sortedEntries.forEach((e) => {
    const s = new Date(e.startDate + "T12:00:00");
    const en = new Date(e.endDate + "T12:00:00");
    for (let d = new Date(s); d <= en; d = addDays(d, 1)) {
      const k = toKey(d);
      if (k <= todayKey) {
        if (k >= e.startDate && k <= e.endDate && todayKey >= e.startDate && todayKey <= e.endDate) {
          currentDates.push(new Date(d));
        } else {
          pastDates.push(new Date(d));
        }
      }
    }
  });

  const predictedDates: Date[] = [];
  if (stats) {
    for (let d = new Date(stats.nextStart); d <= stats.nextEnd; d = addDays(d, 1)) {
      predictedDates.push(new Date(d));
    }
  }

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplets className="text-islamic-pink" size={28} />
            <h1 className="text-3xl font-bold text-gradient-islamic">Women's Care</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Track your cycle. During these days, your prayer streak pauses — not breaks. 💕
          </p>
        </motion.div>

        {/* Stats / Prediction */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-2 mb-4">
            <div className="glass-card rounded-xl p-3 text-center">
              <TrendingUp className="text-islamic-pink mx-auto mb-1" size={16} />
              <p className="text-lg font-bold">{stats.avgCycleLength}d</p>
              <p className="text-[10px] text-muted-foreground">Avg cycle</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Droplets className="text-islamic-pink mx-auto mb-1" size={16} />
              <p className="text-lg font-bold">{stats.avgPeriodLength}d</p>
              <p className="text-[10px] text-muted-foreground">Avg length</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Sparkles className="text-islamic-pink mx-auto mb-1" size={16} />
              <p className="text-lg font-bold">{stats.totalCycles}</p>
              <p className="text-[10px] text-muted-foreground">Logged</p>
            </div>
          </motion.div>
        )}

        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-4 mb-6 text-center border border-islamic-pink/30 bg-islamic-pink/5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Next predicted period</p>
            <p className="text-base font-bold mt-1">
              {format(stats.nextStart, "MMM d")} — {format(stats.nextEnd, "MMM d, yyyy")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Based on your average {stats.avgCycleLength}-day cycle</p>
          </motion.div>
        )}

        {/* Calendar view */}
        <div className="glass-card rounded-2xl p-3 mb-6">
          <p className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider mb-2">Calendar</p>
          <Calendar
            mode="single"
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            modifiers={{
              past: pastDates,
              current: currentDates,
              predicted: predictedDates,
            }}
            modifiersClassNames={{
              past: "bg-islamic-pink/30 text-foreground rounded-full",
              current: "bg-islamic-pink text-white rounded-full font-bold",
              predicted: "border-2 border-islamic-pink/60 border-dashed rounded-full text-islamic-pink",
            }}
            className="p-0 pointer-events-auto mx-auto"
          />
          <div className="flex flex-wrap justify-center gap-3 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-islamic-pink/30 inline-block" /> Past</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-islamic-pink inline-block" /> Current</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-dashed border-islamic-pink inline-block" /> Predicted</span>
          </div>
        </div>

        {/* Add entry */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="font-bold mb-4">Add Cycle Dates</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
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
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional, e.g. cramps, mood)"
            maxLength={200}
            className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm mb-3"
          />
          <Button onClick={addEntry} disabled={!startDate || !endDate} className="w-full">Add Cycle Period</Button>
        </div>

        {/* Entries (history) */}
        {sortedEntries.length > 0 && (
          <div className="space-y-3 mb-8">
            <h3 className="font-bold">History ({sortedEntries.length})</h3>
            {[...sortedEntries].reverse().map((entry) => {
              const isEditing = editingId === entry.id;
              const len = differenceInDays(new Date(entry.endDate + "T12:00:00"), new Date(entry.startDate + "T12:00:00")) + 1;
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 justify-start font-normal">
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {editStart ? format(editStart, "PP") : "Start"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editStart} onSelect={setEditStart} className="p-3 pointer-events-auto" /></PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 justify-start font-normal">
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {editEnd ? format(editEnd, "PP") : "End"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editEnd} onSelect={setEditEnd} className="p-3 pointer-events-auto" /></PopoverContent>
                        </Popover>
                      </div>
                      <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes" maxLength={200} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm" />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={cancelEdit}><X size={14} /> Cancel</Button>
                        <Button size="sm" onClick={saveEdit}><Save size={14} /> Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <Droplets size={16} className="text-islamic-pink mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {format(new Date(entry.startDate + "T12:00:00"), "MMM d")} — {format(new Date(entry.endDate + "T12:00:00"), "MMM d, yyyy")}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{len} day{len !== 1 ? "s" : ""}</p>
                          {entry.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{entry.notes}"</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => startEdit(entry)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted" aria-label="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => removeEntry(entry.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted" aria-label="Delete"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 mb-6 border-l-4" style={{ borderLeftColor: "hsl(var(--islamic-pink))" }}>
          <div className="flex items-start gap-3">
            <Heart className="text-islamic-pink flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground mb-1">How it works</p>
              <ul className="list-disc ml-4 mt-1 space-y-0.5">
                <li>Prayers won't be expected during cycle days</li>
                <li>Your streak pauses instead of breaking</li>
                <li>Reminders shift to dhikr and duas instead</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Guidance section - shown when today is in cycle */}
        {todayActive && <CycleGuidance />}

        {!todayActive && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="glass-card rounded-2xl p-5 text-center bg-islamic-pink/5">
              <p className="text-sm text-muted-foreground">
                🌸 During your cycle days, special guidance with dhikr suggestions will appear here automatically.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CycleTracker;
