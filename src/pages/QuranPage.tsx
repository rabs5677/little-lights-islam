import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Flame, Search } from "lucide-react";
import JuzCard from "@/components/JuzCard";
import FloatingDecorations from "@/components/FloatingDecorations";

interface QuranBookmark {
  juz: number;
  ayahNumber: number;
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  numberInSurah: number;
  timestamp: number;
}

const juzData = [
  { number: 1, arabic: "آلم", english: "Alif Laam Meem" },
  { number: 2, arabic: "سَيَقُولُ", english: "Sayaqool" },
  { number: 3, arabic: "تِلْكَ الرُّسُلُ", english: "Tilkal Rusul" },
  { number: 4, arabic: "لَنْ تَنَالُوا", english: "Lan Tanaloo" },
  { number: 5, arabic: "وَالْمُحْصَنَاتُ", english: "Wal Muhsanaat" },
  { number: 6, arabic: "لَا يُحِبُّ اللَّهُ", english: "La Yuhibbullah" },
  { number: 7, arabic: "وَإِذَا سَمِعُوا", english: "Wa Iza Sami'oo" },
  { number: 8, arabic: "وَلَوْ أَنَّنَا", english: "Wa Lau Annana" },
  { number: 9, arabic: "قَالَ الْمَلَأُ", english: "Qalal Malau" },
  { number: 10, arabic: "وَاعْلَمُوا", english: "Wa A'lamoo" },
  { number: 11, arabic: "يَعْتَذِرُونَ", english: "Ya'taziroon" },
  { number: 12, arabic: "وَمَا مِنْ دَابَّةٍ", english: "Wa Ma Min Daabbah" },
  { number: 13, arabic: "وَمَا أُبَرِّئُ", english: "Wa Ma Ubarri'u" },
  { number: 14, arabic: "رُبَمَا", english: "Rubama" },
  { number: 15, arabic: "سُبْحَانَ الَّذِي", english: "Subhanallazi" },
  { number: 16, arabic: "قَالَ أَلَمْ", english: "Qal Alam" },
  { number: 17, arabic: "اقْتَرَبَ", english: "Iqtarab" },
  { number: 18, arabic: "قَدْ أَفْلَحَ", english: "Qad Aflaha" },
  { number: 19, arabic: "وَقَالَ الَّذِينَ", english: "Wa Qalallazina" },
  { number: 20, arabic: "أَمَّنْ خَلَقَ", english: "A'man Khalaq" },
  { number: 21, arabic: "اتْلُ مَا أُوحِيَ", english: "Utlu Ma Oohiya" },
  { number: 22, arabic: "وَمَنْ يَقْنُتْ", english: "Wa Man Yaqnut" },
  { number: 23, arabic: "وَمَا لِيَ", english: "Wa Mali" },
  { number: 24, arabic: "فَمَنْ أَظْلَمُ", english: "Faman Azlamu" },
  { number: 25, arabic: "إِلَيْهِ يُرَدُّ", english: "Ilaihi Yuraddu" },
  { number: 26, arabic: "حَم", english: "Ha Meem" },
  { number: 27, arabic: "قَالَ فَمَا خَطْبُكُمْ", english: "Qala Fama Khatbukum" },
  { number: 28, arabic: "قَدْ سَمِعَ اللَّهُ", english: "Qad Sami Allahu" },
  { number: 29, arabic: "تَبَارَكَ الَّذِي", english: "Tabarakallazi" },
  { number: 30, arabic: "عَمَّ يَتَسَاءَلُونَ", english: "Amma Yatasaa'aloon" },
];

const getReadingStreak = (): number => {
  const saved = localStorage.getItem("quran-reading-days");
  const days: string[] = saved ? JSON.parse(saved) : [];
  if (days.length === 0) return 0;

  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (days.includes(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (key === new Date().toISOString().split("T")[0] && streak === 0) {
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const QuranPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const bookmark: QuranBookmark | null = (() => {
    const saved = localStorage.getItem("quran-bookmark-v2");
    return saved ? JSON.parse(saved) : null;
  })();

  const streak = getReadingStreak();

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzData;
    const q = searchQuery.toLowerCase().trim();
    return juzData.filter(
      (j) =>
        j.number.toString().includes(q) ||
        j.english.toLowerCase().includes(q) ||
        j.arabic.includes(q) ||
        `juz ${j.number}`.includes(q) ||
        `parah ${j.number}`.includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-islamic mb-2">
            📖 Quran
          </h1>
          <p className="text-muted-foreground">Read the Holy Quran by Juz</p>
        </motion.div>

        {/* Streak + Last Read row */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
          {/* Reading streak */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-glow-pulse flex-1"
            >
              <Flame className="text-islamic-gold" size={22} />
              <div>
                <p className="text-xs text-muted-foreground">Reading Streak</p>
                <p className="font-bold text-lg">{streak} day{streak > 1 ? "s" : ""}</p>
              </div>
            </motion.div>
          )}

          {/* Last read card */}
          {bookmark && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <button
                onClick={() => navigate(`/quran/${bookmark.juz}`)}
                className="w-full glass-card glow-gold rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-islamic-gold/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-islamic-gold" size={22} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs text-muted-foreground">Last Read</p>
                  <p className="font-bold truncate">
                    {bookmark.surahName} — Ayah {bookmark.numberInSurah}
                  </p>
                  <p className="text-xs text-muted-foreground">Juz {bookmark.juz}</p>
                </div>
              </button>
            </motion.div>
          )}
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Juz, Parah, or Surah name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Juz Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {filteredJuz.map((juz, i) => (
            <JuzCard
              key={juz.number}
              number={juz.number}
              arabicName={juz.arabic}
              englishName={juz.english}
              isBookmarked={bookmark?.juz === juz.number}
              onClick={() => navigate(`/quran/${juz.number}`)}
              index={i}
            />
          ))}
          {filteredJuz.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuranPage;
