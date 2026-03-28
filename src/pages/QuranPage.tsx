import { useState, useMemo, useEffect } from "react";
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

// All 114 surahs mapped to their juz (first juz they appear in)
const SURAH_DATA = [
  { number: 1, name: "Al-Fatiha", arabic: "الفاتحة", juz: 1 },
  { number: 2, name: "Al-Baqarah", arabic: "البقرة", juz: 1 },
  { number: 3, name: "Aal-E-Imran", arabic: "آل عمران", juz: 3 },
  { number: 4, name: "An-Nisa", arabic: "النساء", juz: 4 },
  { number: 5, name: "Al-Ma'idah", arabic: "المائدة", juz: 6 },
  { number: 6, name: "Al-An'am", arabic: "الأنعام", juz: 7 },
  { number: 7, name: "Al-A'raf", arabic: "الأعراف", juz: 8 },
  { number: 8, name: "Al-Anfal", arabic: "الأنفال", juz: 9 },
  { number: 9, name: "At-Tawbah", arabic: "التوبة", juz: 10 },
  { number: 10, name: "Yunus", arabic: "يونس", juz: 11 },
  { number: 11, name: "Hud", arabic: "هود", juz: 11 },
  { number: 12, name: "Yusuf", arabic: "يوسف", juz: 12 },
  { number: 13, name: "Ar-Ra'd", arabic: "الرعد", juz: 13 },
  { number: 14, name: "Ibrahim", arabic: "إبراهيم", juz: 13 },
  { number: 15, name: "Al-Hijr", arabic: "الحجر", juz: 14 },
  { number: 16, name: "An-Nahl", arabic: "النحل", juz: 14 },
  { number: 17, name: "Al-Isra", arabic: "الإسراء", juz: 15 },
  { number: 18, name: "Al-Kahf", arabic: "الكهف", juz: 15 },
  { number: 19, name: "Maryam", arabic: "مريم", juz: 16 },
  { number: 20, name: "Taha", arabic: "طه", juz: 16 },
  { number: 21, name: "Al-Anbiya", arabic: "الأنبياء", juz: 17 },
  { number: 22, name: "Al-Hajj", arabic: "الحج", juz: 17 },
  { number: 23, name: "Al-Mu'minun", arabic: "المؤمنون", juz: 18 },
  { number: 24, name: "An-Nur", arabic: "النور", juz: 18 },
  { number: 25, name: "Al-Furqan", arabic: "الفرقان", juz: 18 },
  { number: 26, name: "Ash-Shu'ara", arabic: "الشعراء", juz: 19 },
  { number: 27, name: "An-Naml", arabic: "النمل", juz: 19 },
  { number: 28, name: "Al-Qasas", arabic: "القصص", juz: 20 },
  { number: 29, name: "Al-Ankabut", arabic: "العنكبوت", juz: 20 },
  { number: 30, name: "Ar-Rum", arabic: "الروم", juz: 21 },
  { number: 31, name: "Luqman", arabic: "لقمان", juz: 21 },
  { number: 32, name: "As-Sajdah", arabic: "السجدة", juz: 21 },
  { number: 33, name: "Al-Ahzab", arabic: "الأحزاب", juz: 21 },
  { number: 34, name: "Saba", arabic: "سبأ", juz: 22 },
  { number: 35, name: "Fatir", arabic: "فاطر", juz: 22 },
  { number: 36, name: "Ya-Sin", arabic: "يس", juz: 22 },
  { number: 37, name: "As-Saffat", arabic: "الصافات", juz: 23 },
  { number: 38, name: "Sad", arabic: "ص", juz: 23 },
  { number: 39, name: "Az-Zumar", arabic: "الزمر", juz: 23 },
  { number: 40, name: "Ghafir", arabic: "غافر", juz: 24 },
  { number: 41, name: "Fussilat", arabic: "فصلت", juz: 24 },
  { number: 42, name: "Ash-Shura", arabic: "الشورى", juz: 25 },
  { number: 43, name: "Az-Zukhruf", arabic: "الزخرف", juz: 25 },
  { number: 44, name: "Ad-Dukhan", arabic: "الدخان", juz: 25 },
  { number: 45, name: "Al-Jathiyah", arabic: "الجاثية", juz: 25 },
  { number: 46, name: "Al-Ahqaf", arabic: "الأحقاف", juz: 26 },
  { number: 47, name: "Muhammad", arabic: "محمد", juz: 26 },
  { number: 48, name: "Al-Fath", arabic: "الفتح", juz: 26 },
  { number: 49, name: "Al-Hujurat", arabic: "الحجرات", juz: 26 },
  { number: 50, name: "Qaf", arabic: "ق", juz: 26 },
  { number: 51, name: "Adh-Dhariyat", arabic: "الذاريات", juz: 26 },
  { number: 52, name: "At-Tur", arabic: "الطور", juz: 27 },
  { number: 53, name: "An-Najm", arabic: "النجم", juz: 27 },
  { number: 54, name: "Al-Qamar", arabic: "القمر", juz: 27 },
  { number: 55, name: "Ar-Rahman", arabic: "الرحمن", juz: 27 },
  { number: 56, name: "Al-Waqi'ah", arabic: "الواقعة", juz: 27 },
  { number: 57, name: "Al-Hadid", arabic: "الحديد", juz: 27 },
  { number: 58, name: "Al-Mujadila", arabic: "المجادلة", juz: 28 },
  { number: 59, name: "Al-Hashr", arabic: "الحشر", juz: 28 },
  { number: 60, name: "Al-Mumtahanah", arabic: "الممتحنة", juz: 28 },
  { number: 61, name: "As-Saff", arabic: "الصف", juz: 28 },
  { number: 62, name: "Al-Jumu'ah", arabic: "الجمعة", juz: 28 },
  { number: 63, name: "Al-Munafiqun", arabic: "المنافقون", juz: 28 },
  { number: 64, name: "At-Taghabun", arabic: "التغابن", juz: 28 },
  { number: 65, name: "At-Talaq", arabic: "الطلاق", juz: 28 },
  { number: 66, name: "At-Tahrim", arabic: "التحريم", juz: 28 },
  { number: 67, name: "Al-Mulk", arabic: "الملك", juz: 29 },
  { number: 68, name: "Al-Qalam", arabic: "القلم", juz: 29 },
  { number: 69, name: "Al-Haqqah", arabic: "الحاقة", juz: 29 },
  { number: 70, name: "Al-Ma'arij", arabic: "المعارج", juz: 29 },
  { number: 71, name: "Nuh", arabic: "نوح", juz: 29 },
  { number: 72, name: "Al-Jinn", arabic: "الجن", juz: 29 },
  { number: 73, name: "Al-Muzzammil", arabic: "المزمل", juz: 29 },
  { number: 74, name: "Al-Muddathir", arabic: "المدثر", juz: 29 },
  { number: 75, name: "Al-Qiyamah", arabic: "القيامة", juz: 29 },
  { number: 76, name: "Al-Insan", arabic: "الإنسان", juz: 29 },
  { number: 77, name: "Al-Mursalat", arabic: "المرسلات", juz: 29 },
  { number: 78, name: "An-Naba", arabic: "النبأ", juz: 30 },
  { number: 79, name: "An-Nazi'at", arabic: "النازعات", juz: 30 },
  { number: 80, name: "Abasa", arabic: "عبس", juz: 30 },
  { number: 81, name: "At-Takwir", arabic: "التكوير", juz: 30 },
  { number: 82, name: "Al-Infitar", arabic: "الانفطار", juz: 30 },
  { number: 83, name: "Al-Mutaffifin", arabic: "المطففين", juz: 30 },
  { number: 84, name: "Al-Inshiqaq", arabic: "الانشقاق", juz: 30 },
  { number: 85, name: "Al-Buruj", arabic: "البروج", juz: 30 },
  { number: 86, name: "At-Tariq", arabic: "الطارق", juz: 30 },
  { number: 87, name: "Al-A'la", arabic: "الأعلى", juz: 30 },
  { number: 88, name: "Al-Ghashiyah", arabic: "الغاشية", juz: 30 },
  { number: 89, name: "Al-Fajr", arabic: "الفجر", juz: 30 },
  { number: 90, name: "Al-Balad", arabic: "البلد", juz: 30 },
  { number: 91, name: "Ash-Shams", arabic: "الشمس", juz: 30 },
  { number: 92, name: "Al-Lail", arabic: "الليل", juz: 30 },
  { number: 93, name: "Ad-Duhaa", arabic: "الضحى", juz: 30 },
  { number: 94, name: "Ash-Sharh", arabic: "الشرح", juz: 30 },
  { number: 95, name: "At-Tin", arabic: "التين", juz: 30 },
  { number: 96, name: "Al-Alaq", arabic: "العلق", juz: 30 },
  { number: 97, name: "Al-Qadr", arabic: "القدر", juz: 30 },
  { number: 98, name: "Al-Bayyinah", arabic: "البينة", juz: 30 },
  { number: 99, name: "Az-Zalzalah", arabic: "الزلزلة", juz: 30 },
  { number: 100, name: "Al-Adiyat", arabic: "العاديات", juz: 30 },
  { number: 101, name: "Al-Qari'ah", arabic: "القارعة", juz: 30 },
  { number: 102, name: "At-Takathur", arabic: "التكاثر", juz: 30 },
  { number: 103, name: "Al-Asr", arabic: "العصر", juz: 30 },
  { number: 104, name: "Al-Humazah", arabic: "الهمزة", juz: 30 },
  { number: 105, name: "Al-Fil", arabic: "الفيل", juz: 30 },
  { number: 106, name: "Quraysh", arabic: "قريش", juz: 30 },
  { number: 107, name: "Al-Ma'un", arabic: "الماعون", juz: 30 },
  { number: 108, name: "Al-Kawthar", arabic: "الكوثر", juz: 30 },
  { number: 109, name: "Al-Kafirun", arabic: "الكافرون", juz: 30 },
  { number: 110, name: "An-Nasr", arabic: "النصر", juz: 30 },
  { number: 111, name: "Al-Masad", arabic: "المسد", juz: 30 },
  { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", juz: 30 },
  { number: 113, name: "Al-Falaq", arabic: "الفلق", juz: 30 },
  { number: 114, name: "An-Nas", arabic: "الناس", juz: 30 },
];

const getReadingStreak = (): number => {
  const saved = localStorage.getItem("quran-reading-days");
  const days: string[] = saved ? JSON.parse(saved) : [];
  if (days.length === 0) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (days.includes(key)) { streak++; d.setDate(d.getDate() - 1); }
    else if (key === new Date().toISOString().split("T")[0] && streak === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
};

const QuranPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"juz" | "surah">("juz");

  const bookmark: QuranBookmark | null = (() => {
    const saved = localStorage.getItem("quran-bookmark-v2");
    return saved ? JSON.parse(saved) : null;
  })();

  const streak = getReadingStreak();

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzData;
    const q = searchQuery.toLowerCase().trim();
    return juzData.filter(
      j => j.number.toString().includes(q) || j.english.toLowerCase().includes(q) || j.arabic.includes(q) || `juz ${j.number}`.includes(q)
    );
  }, [searchQuery]);

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAH_DATA;
    const q = searchQuery.toLowerCase().trim();
    return SURAH_DATA.filter(
      s => s.name.toLowerCase().includes(q) || s.arabic.includes(q) || s.number.toString() === q || `surah ${s.name}`.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-islamic mb-2">📖 Quran</h1>
          <p className="text-muted-foreground">Read the Holy Quran</p>
        </motion.div>

        {/* Streak + Last Read */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
          {streak > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-glow-pulse flex-1">
              <Flame className="text-islamic-gold" size={22} />
              <div>
                <p className="text-xs text-muted-foreground">Reading Streak</p>
                <p className="font-bold text-lg">{streak} day{streak > 1 ? "s" : ""}</p>
              </div>
            </motion.div>
          )}
          {bookmark && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <button onClick={() => navigate(`/quran/${bookmark.juz}`)} className="w-full glass-card glow-gold rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform active:scale-[0.98]">
                <div className="w-12 h-12 rounded-full bg-islamic-gold/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-islamic-gold" size={22} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs text-muted-foreground">Last Read</p>
                  <p className="font-bold truncate">{bookmark.surahName} — Ayah {bookmark.numberInSurah}</p>
                  <p className="text-xs text-muted-foreground">Juz {bookmark.juz}</p>
                </div>
              </button>
            </motion.div>
          )}
        </div>

        {/* Search + Mode Toggle */}
        <div className="max-w-md mx-auto mb-6 space-y-3">
          <div className="flex gap-2 justify-center">
            <button onClick={() => setSearchMode("juz")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchMode === "juz" ? "bg-primary text-primary-foreground" : "glass-card"}`}>Browse by Juz</button>
            <button onClick={() => setSearchMode("surah")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchMode === "surah" ? "bg-primary text-primary-foreground" : "glass-card"}`}>Search Surah</button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={searchMode === "juz" ? "Search Juz number or name..." : "Search Surah name (e.g. Rahman, Yaseen)..."}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {searchMode === "juz" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {filteredJuz.map((juz, i) => (
              <JuzCard key={juz.number} number={juz.number} arabicName={juz.arabic} englishName={juz.english} isBookmarked={bookmark?.juz === juz.number} onClick={() => navigate(`/quran/${juz.number}`)} index={i} />
            ))}
            {filteredJuz.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">No results found</div>}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-2">
            {filteredSurahs.map((s, i) => (
              <motion.button
                key={s.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                onClick={() => navigate(`/quran/${s.juz}`)}
                className="w-full glass-card rounded-xl p-3 flex items-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-transform text-left"
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{s.number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Juz {s.juz}</p>
                </div>
                <p className="arabic-font text-lg text-muted-foreground">{s.arabic}</p>
              </motion.button>
            ))}
            {filteredSurahs.length === 0 && <div className="text-center py-8 text-muted-foreground">No Surah found</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranPage;
