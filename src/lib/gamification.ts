// Gamification system: Streaks, XP, Achievements

const STORAGE_KEYS = {
  xp: "jannahpath-xp",
  streaks: "jannahpath-streaks",
  achievements: "jannahpath-achievements",
  activityLog: "jannahpath-activity-log",
  coins: "jannahpath-coins",
  customDhikr: "jannahpath-custom-dhikr",
};

// Coins — 1 dhikr = 1 coin
export const getCoins = (): number =>
  parseInt(localStorage.getItem(STORAGE_KEYS.coins) || "0", 10);

export const addCoins = (n: number): number => {
  const next = getCoins() + n;
  localStorage.setItem(STORAGE_KEYS.coins, next.toString());
  return next;
};

export const spendCoins = (n: number): boolean => {
  const cur = getCoins();
  if (cur < n) return false;
  localStorage.setItem(STORAGE_KEYS.coins, (cur - n).toString());
  return true;
};

export interface CustomDhikr {
  id: string;
  name: string;
  arabic?: string;
  target: number;
}

export const getCustomDhikr = (): CustomDhikr[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.customDhikr);
  return saved ? JSON.parse(saved) : [];
};

export const addCustomDhikr = (d: Omit<CustomDhikr, "id">): CustomDhikr => {
  const all = getCustomDhikr();
  const item: CustomDhikr = { ...d, id: Math.random().toString(36).slice(2, 10) };
  all.push(item);
  localStorage.setItem(STORAGE_KEYS.customDhikr, JSON.stringify(all));
  return item;
};

export const removeCustomDhikr = (id: string) => {
  const all = getCustomDhikr().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.customDhikr, JSON.stringify(all));
};

export interface StreakData {
  quran: number;
  dhikr: number;
  namaz: number;
  lastQuran: string | null;
  lastDhikr: string | null;
  lastNamaz: string | null;
}

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "dhikr_100", label: "100 Dhikr", icon: "🌟", unlocked: false },
  { id: "dhikr_500", label: "500 Dhikr", icon: "🏅", unlocked: false },
  { id: "dhikr_1000", label: "1000 Dhikr", icon: "👑", unlocked: false },
  { id: "streak_7", label: "7 Day Streak", icon: "🔥", unlocked: false },
  { id: "streak_30", label: "30 Day Streak", icon: "💎", unlocked: false },
  { id: "quran_reader", label: "Read 5 Juz", icon: "📖", unlocked: false },
  { id: "first_dhikr", label: "First Dhikr", icon: "📿", unlocked: false },
  { id: "first_quran", label: "First Quran Read", icon: "🕌", unlocked: false },
];

const getTodayKey = () => new Date().toISOString().split("T")[0];

const getYesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

export const getXP = (): number => {
  return parseInt(localStorage.getItem(STORAGE_KEYS.xp) || "0", 10);
};

export const addXP = (points: number): number => {
  const current = getXP();
  const next = current + points;
  localStorage.setItem(STORAGE_KEYS.xp, next.toString());
  return next;
};

export const getLevel = (xp: number): { level: number; title: string; progress: number; nextXP: number } => {
  const levels = [
    { xp: 0, title: "Beginner" },
    { xp: 50, title: "Seeker" },
    { xp: 150, title: "Learner" },
    { xp: 350, title: "Devoted" },
    { xp: 700, title: "Faithful" },
    { xp: 1200, title: "Guardian" },
    { xp: 2000, title: "Scholar" },
    { xp: 3500, title: "Muhsin" },
  ];
  let level = 1;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) { level = i + 1; break; }
  }
  const currentLevelXP = levels[level - 1]?.xp || 0;
  const nextLevelXP = levels[level]?.xp || currentLevelXP + 500;
  const progress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  return { level, title: levels[level - 1]?.title || "Master", progress, nextXP: nextLevelXP };
};

export const getStreaks = (): StreakData => {
  const saved = localStorage.getItem(STORAGE_KEYS.streaks);
  if (!saved) return { quran: 0, dhikr: 0, namaz: 0, lastQuran: null, lastDhikr: null, lastNamaz: null };
  return JSON.parse(saved);
};

export const recordActivity = (type: "quran" | "dhikr" | "namaz"): StreakData => {
  const streaks = getStreaks();
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  const lastKey = `last${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof StreakData;
  const lastDate = streaks[lastKey] as string | null;

  if (lastDate === today) return streaks; // Already recorded today

  if (lastDate === yesterday) {
    (streaks as any)[type] += 1;
  } else {
    (streaks as any)[type] = 1;
  }
  (streaks as any)[lastKey] = today;

  localStorage.setItem(STORAGE_KEYS.streaks, JSON.stringify(streaks));

  // Check streak achievements
  const maxStreak = Math.max(streaks.quran, streaks.dhikr, streaks.namaz);
  if (maxStreak >= 7) unlockAchievement("streak_7");
  if (maxStreak >= 30) unlockAchievement("streak_30");
  if (type === "quran") unlockAchievement("first_quran");
  if (type === "dhikr") unlockAchievement("first_dhikr");

  return streaks;
};

export const getAchievements = (): Achievement[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.achievements);
  if (!saved) return [...DEFAULT_ACHIEVEMENTS];
  return JSON.parse(saved);
};

export const unlockAchievement = (id: string): boolean => {
  const achievements = getAchievements();
  const achievement = achievements.find(a => a.id === id);
  if (!achievement || achievement.unlocked) return false;
  achievement.unlocked = true;
  achievement.unlockedAt = getTodayKey();
  localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));
  return true;
};

export const checkDhikrAchievements = (totalCount: number) => {
  if (totalCount >= 100) unlockAchievement("dhikr_100");
  if (totalCount >= 500) unlockAchievement("dhikr_500");
  if (totalCount >= 1000) unlockAchievement("dhikr_1000");
};

export const ENCOURAGEMENT_MESSAGES = [
  "MashaAllah! Keep going 💖",
  "Allah loves consistency 🤍",
  "You're doing amazing 🌙",
  "Beautiful dedication ✨",
  "SubhanAllah, well done! 🤲",
  "Your heart is in the right place 💚",
  "Every step counts 🌟",
  "May Allah reward you 🕌",
];

export const getRandomEncouragement = () =>
  ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
