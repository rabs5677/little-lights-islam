import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, BookOpen, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: { englishName: string; name: string; number: number };
  translation?: string;
}

interface QuranBookmark {
  juz: number;
  ayahNumber: number;
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  numberInSurah: number;
  timestamp: number;
}

const AYAHS_PER_PAGE = 15;

const QuranReader = () => {
  const { juzNumber } = useParams();
  const juz = parseInt(juzNumber || "1");
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const bookmarkRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBookmark, setHasScrolledToBookmark] = useState(false);

  const [bookmark, setBookmark] = useState<QuranBookmark | null>(() => {
    const saved = localStorage.getItem("quran-bookmark-v2");
    return saved ? JSON.parse(saved) : null;
  });

  const isBookmarkedJuz = bookmark?.juz === juz;

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
    setHasScrolledToBookmark(false);
  }, [juz]);

  // Auto-navigate to bookmarked page
  useEffect(() => {
    if (!loading && ayahs.length > 0 && isBookmarkedJuz && bookmark && !hasScrolledToBookmark) {
      const idx = ayahs.findIndex(a => a.number === bookmark.ayahNumber);
      if (idx >= 0) {
        const page = Math.floor(idx / AYAHS_PER_PAGE);
        setCurrentPage(page);
        setHasScrolledToBookmark(true);
        // Scroll to bookmark after page renders
        setTimeout(() => {
          bookmarkRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [loading, ayahs, isBookmarkedJuz, bookmark, hasScrolledToBookmark]);

  const totalPages = Math.ceil(ayahs.length / AYAHS_PER_PAGE);
  const pageAyahs = ayahs.slice(currentPage * AYAHS_PER_PAGE, (currentPage + 1) * AYAHS_PER_PAGE);

  const bookmarkAyah = useCallback((ayah: Ayah) => {
    const bm: QuranBookmark = {
      juz,
      ayahNumber: ayah.number,
      surahNumber: ayah.surah.number,
      surahName: ayah.surah.englishName,
      surahArabic: ayah.surah.name,
      numberInSurah: ayah.numberInSurah,
      timestamp: Date.now(),
    };
    setBookmark(bm);
    localStorage.setItem("quran-bookmark-v2", JSON.stringify(bm));
  }, [juz]);

  const clearBookmark = useCallback(() => {
    setBookmark(null);
    localStorage.removeItem("quran-bookmark-v2");
  }, []);

  const resumeBookmark = useCallback(() => {
    if (!bookmark) return;
    if (bookmark.juz !== juz) {
      window.location.href = `/quran/${bookmark.juz}`;
      return;
    }
    const idx = ayahs.findIndex(a => a.number === bookmark.ayahNumber);
    if (idx >= 0) {
      setCurrentPage(Math.floor(idx / AYAHS_PER_PAGE));
      setTimeout(() => {
        bookmarkRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [bookmark, juz, ayahs]);

  // Group page ayahs by surah
  const surahGroups: { surah: Ayah["surah"]; ayahs: Ayah[] }[] = [];
  pageAyahs.forEach((ayah) => {
    const last = surahGroups[surahGroups.length - 1];
    if (last && last.surah.number === ayah.surah.number) {
      last.ayahs.push(ayah);
    } else {
      surahGroups.push({ surah: ayah.surah, ayahs: [ayah] });
    }
  });

  // Convert ayah number to Arabic-Indic numerals for Mushaf style
  const toArabicNum = (n: number) =>
    n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-3xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <Link
            to="/quran"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">All Juz</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {bookmark && (
              <button
                onClick={resumeBookmark}
                className="glass-card rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 hover:scale-105 transition-transform text-islamic-gold font-medium"
              >
                <BookOpen size={14} />
                <span className="hidden sm:inline">Resume</span>
              </button>
            )}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="glass-card rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">
                {showTranslation ? "Mushaf" : "Translation"}
              </span>
            </button>
          </div>
        </div>

        {/* Bookmark info */}
        {bookmark && (
          <div className="mb-4 text-center">
            <p className="text-xs text-muted-foreground">
              📖 Bookmarked: {bookmark.surahName} ({bookmark.surahArabic}) — Ayah {bookmark.numberInSurah} · Juz {bookmark.juz}
            </p>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-islamic">
            Juz {juz}
          </h1>
          {totalPages > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Page {currentPage + 1} of {totalPages}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentPage}-${showTranslation}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {showTranslation ? (
                  /* === Translation mode: line-by-line === */
                  <div className="space-y-6">
                    {surahGroups.map((group) => (
                      <div
                        key={`${group.surah.number}-${group.ayahs[0].numberInSurah}`}
                        className="glass-card rounded-2xl p-5 sm:p-6"
                      >
                        <div className="text-center mb-4 pb-3 border-b border-border">
                          <p className="arabic-font text-xl text-islamic-gold">{group.surah.name}</p>
                          <p className="text-sm text-muted-foreground">{group.surah.englishName}</p>
                        </div>
                        <div className="space-y-4">
                          {group.ayahs.map((ayah) => {
                            const isBookmarked = bookmark?.ayahNumber === ayah.number;
                            return (
                              <div
                                key={ayah.number}
                                ref={isBookmarked ? bookmarkRef : undefined}
                                className={`pb-3 border-b border-border/50 last:border-0 relative group rounded-xl transition-all duration-300 ${
                                  isBookmarked ? "bg-islamic-gold/10 px-3 py-2 ring-1 ring-islamic-gold/30" : ""
                                }`}
                              >
                                {isBookmarked && (
                                  <div className="flex items-center gap-1 mb-1">
                                    <Bookmark size={12} className="text-islamic-gold" fill="currentColor" />
                                    <span className="text-[10px] text-islamic-gold font-medium">Last read</span>
                                  </div>
                                )}
                                <div className="flex items-start gap-3">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-islamic-cream flex items-center justify-center text-xs font-bold text-foreground/70">
                                      {ayah.numberInSurah}
                                    </span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); bookmarkAyah(ayah); }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Bookmark this ayah"
                                    >
                                      <Bookmark size={12} className="text-muted-foreground hover:text-islamic-gold" />
                                    </button>
                                  </div>
                                  <div className="flex-1">
                                    <p className="arabic-font text-right text-xl sm:text-2xl leading-[2.2] mb-2">
                                      {ayah.text}
                                    </p>
                                    {translations[ayah.number] && (
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {translations[ayah.number]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* === Mushaf mode: page-style === */
                  <div className="mushaf-page bg-islamic-cream rounded-2xl p-6 sm:p-10 shadow-xl border border-islamic-gold/20 relative overflow-hidden">
                    {/* Decorative border */}
                    <div className="absolute inset-2 sm:inset-4 border border-islamic-gold/15 rounded-xl pointer-events-none" />
                    <div className="absolute inset-3 sm:inset-6 border border-islamic-gold/10 rounded-lg pointer-events-none" />

                    {/* Surah headers in mushaf */}
                    {surahGroups.map((group, gi) => (
                      <div key={`${group.surah.number}-${group.ayahs[0].numberInSurah}`}>
                        {/* Surah divider */}
                        {(gi > 0 || group.ayahs[0].numberInSurah === 1) && (
                          <div className="my-6 text-center">
                            <div className="inline-block bg-islamic-gold/10 border border-islamic-gold/25 rounded-xl px-6 py-3">
                              <p className="arabic-font text-xl sm:text-2xl text-islamic-gold">{group.surah.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{group.surah.englishName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Mushaf flowing text */}
                    <div className="arabic-font text-right text-xl sm:text-2xl md:text-[1.7rem] leading-[2.8] sm:leading-[3] relative z-10 select-text" dir="rtl">
                      {pageAyahs.map((ayah) => {
                        const isBookmarked = bookmark?.ayahNumber === ayah.number;
                        return (
                          <span
                            key={ayah.number}
                            ref={isBookmarked ? bookmarkRef : undefined}
                            className={`relative group/ayah cursor-pointer transition-colors duration-300 ${
                              isBookmarked
                                ? "bg-islamic-gold/15 rounded px-1"
                                : "hover:bg-islamic-gold/5 rounded"
                            }`}
                            onClick={() => bookmarkAyah(ayah)}
                          >
                            {isBookmarked && (
                              <span className="absolute -top-5 right-0 flex items-center gap-0.5 text-[9px] text-islamic-gold font-quicksand whitespace-nowrap">
                                <Bookmark size={8} fill="currentColor" /> Last read
                              </span>
                            )}
                            {ayah.text}
                            {" "}
                            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-islamic-gold/40 text-islamic-gold text-sm sm:text-base mx-0.5 align-middle">
                              {toArabicNum(ayah.numberInSurah)}
                            </span>
                            {" "}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Page navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === 0}
                  className="glass-card rounded-xl p-3 hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage >= totalPages - 1}
                  className="glass-card rounded-xl p-3 hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuranReader;
