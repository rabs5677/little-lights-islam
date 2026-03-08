import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Eye, EyeOff, Loader2 } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: { englishName: string; name: string; number: number };
  translation?: string;
}

const QuranReader = () => {
  const { juzNumber } = useParams();
  const juz = parseInt(juzNumber || "1");
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    const saved = localStorage.getItem("quran-bookmark");
    return saved ? parseInt(saved) === juz : false;
  });

  useEffect(() => {
    const fetchQuran = async () => {
      setLoading(true);
      try {
        const [arabicRes, translationRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/juz/${juz}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/juz/${juz}/en.asad`),
        ]);
        const arabicData = await arabicRes.json();
        const translationData = await translationRes.json();

        if (arabicData.data?.ayahs) {
          setAyahs(arabicData.data.ayahs);
        }
        if (translationData.data?.ayahs) {
          const transMap: Record<number, string> = {};
          translationData.data.ayahs.forEach((a: any) => {
            transMap[a.number] = a.text;
          });
          setTranslations(transMap);
        }
      } catch (err) {
        console.error("Failed to fetch Quran data:", err);
      }
      setLoading(false);
    };
    fetchQuran();
  }, [juz]);

  const toggleBookmark = () => {
    if (isBookmarked) {
      localStorage.removeItem("quran-bookmark");
      setIsBookmarked(false);
    } else {
      localStorage.setItem("quran-bookmark", juz.toString());
      setIsBookmarked(true);
    }
  };

  // Group ayahs by surah
  const surahGroups: { surah: Ayah["surah"]; ayahs: Ayah[] }[] = [];
  ayahs.forEach((ayah) => {
    const last = surahGroups[surahGroups.length - 1];
    if (last && last.surah.number === ayah.surah.number) {
      last.ayahs.push(ayah);
    } else {
      surahGroups.push({ surah: ayah.surah, ayahs: [ayah] });
    }
  });

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-3xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/quran"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">All Juz</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="glass-card rounded-xl px-3 py-2 text-sm flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">
                {showTranslation ? "Hide" : "Show"} Translation
              </span>
            </button>
            <button
              onClick={toggleBookmark}
              className={`rounded-xl px-3 py-2 text-sm flex items-center gap-1.5 transition-all duration-300 ${
                isBookmarked
                  ? "bg-islamic-gold text-primary-foreground glow-gold"
                  : "glass-card hover:scale-105"
              }`}
            >
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
              <span className="hidden sm:inline">Bookmark</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-islamic">
            Juz {juz}
          </h1>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <div className="space-y-6">
            {surahGroups.map((group) => (
              <motion.div
                key={`${group.surah.number}-${group.ayahs[0].numberInSurah}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 sm:p-6"
              >
                {/* Surah header */}
                <div className="text-center mb-4 pb-3 border-b border-border">
                  <p className="arabic-font text-xl text-islamic-gold">{group.surah.name}</p>
                  <p className="text-sm text-muted-foreground">{group.surah.englishName}</p>
                </div>

                {/* Ayahs */}
                <div className="space-y-4">
                  {group.ayahs.map((ayah) => (
                    <div key={ayah.number} className="pb-3 border-b border-border/50 last:border-0">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-islamic-cream flex items-center justify-center text-xs font-bold text-foreground/70">
                          {ayah.numberInSurah}
                        </span>
                        <div className="flex-1">
                          <p className="arabic-font text-right text-xl sm:text-2xl leading-[2.2] mb-2">
                            {ayah.text}
                          </p>
                          {showTranslation && translations[ayah.number] && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="text-sm text-muted-foreground leading-relaxed"
                            >
                              {translations[ayah.number]}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranReader;
