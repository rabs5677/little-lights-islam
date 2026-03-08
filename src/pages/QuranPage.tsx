import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import JuzCard from "@/components/JuzCard";
import FloatingDecorations from "@/components/FloatingDecorations";

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

const QuranPage = () => {
  const navigate = useNavigate();
  const [bookmarkedJuz, setBookmarkedJuz] = useState<number | null>(() => {
    const saved = localStorage.getItem("quran-bookmark");
    return saved ? parseInt(saved) : null;
  });

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-islamic mb-2">
            📖 Quran
          </h1>
          <p className="text-muted-foreground">Read the Holy Quran by Juz</p>
        </motion.div>

        {/* Continue reading */}
        {bookmarkedJuz && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8"
          >
            <button
              onClick={() => navigate(`/quran/${bookmarkedJuz}`)}
              className="w-full glass-card glow-gold rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-islamic-gold/20 flex items-center justify-center">
                <BookOpen className="text-islamic-gold" size={22} />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Continue Reading</p>
                <p className="font-bold">
                  Juz {bookmarkedJuz} — {juzData[bookmarkedJuz - 1]?.english}
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {/* Juz Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {juzData.map((juz, i) => (
            <JuzCard
              key={juz.number}
              number={juz.number}
              arabicName={juz.arabic}
              englishName={juz.english}
              isBookmarked={bookmarkedJuz === juz.number}
              onClick={() => navigate(`/quran/${juz.number}`)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuranPage;
