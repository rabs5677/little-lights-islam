import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, Bookmark, BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";
import QuranAudioPlayer from "@/components/QuranAudioPlayer";

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

const toArabicNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

const recordReadingDay = () => {
  const today = new Date().toISOString().split("T")[0];
  const saved = localStorage.getItem("quran-reading-days");
  const days: string[] = saved ? JSON.parse(saved) : [];
  if (!days.includes(today)) {
    days.push(today);
    if (days.length > 365) days.shift();
    localStorage.setItem("quran-reading-days", JSON.stringify(days));
  }
};

// Simple tajweed-like coloring: color certain Arabic letter patterns
const colorizeAyah = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let i = 0;
  const chars = [...text];

  // Noon sakin / tanween markers
  const noonChars = new Set(["ً", "ٌ", "ٍ"]);
  // Madd letters
  const maddLetters = new Set(["ا", "و", "ي", "ى"]);
  // Shaddah
  const shaddah = "ّ";
  // Ghunna-related
  const ghunnaLetters = new Set(["ن", "م"]);

  for (let idx = 0; idx < chars.length; idx++) {
    const ch = chars[idx];
    const next = chars[idx + 1] || "";
    const prev = chars[idx - 1] || "";

    // Shaddah - red
    if (ch === shaddah) {
      parts.push(<span key={idx} className="text-[hsl(0,70%,55%)] dark:text-[hsl(0,80%,65%)]">{ch}</span>);
    }
    // Tanween - green
    else if (noonChars.has(ch)) {
      parts.push(<span key={idx} className="text-[hsl(140,60%,40%)] dark:text-[hsl(140,70%,55%)]">{ch}</span>);
    }
    // Noon with sukoon or ghunna letters in specific patterns - blue  
    else if (ghunnaLetters.has(ch) && (next === "ْ" || next === shaddah)) {
      parts.push(<span key={idx} className="text-[hsl(210,70%,50%)] dark:text-[hsl(210,80%,65%)]">{ch}</span>);
    }
    // Madd letters following fathah/kasrah/dammah - pink/magenta
    else if (maddLetters.has(ch) && (prev === "َ" || prev === "ِ" || prev === "ُ")) {
      parts.push(<span key={idx} className="text-[hsl(320,60%,50%)] dark:text-[hsl(320,70%,65%)]">{ch}</span>);
    }
    else {
      parts.push(ch);
    }
  }
  return parts;
};

const QuranReader = () => {
  const { juzNumber } = useParams();
  const juz = parseInt(juzNumber || "1");
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const bookmarkRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBookmark, setHasScrolledToBookmark] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(0);

  const [bookmark, setBookmark] = useState<QuranBookmark | null>(() => {
    const saved = localStorage.getItem("quran-bookmark-v2");
    return saved ? JSON.parse(saved) : null;
  });

  const isBookmarkedJuz = bookmark?.juz === juz;

  useEffect(() => {
    if (ayahs.length > 0 && !loading) {
      const pageAyahs = ayahs.slice(currentPage * AYAHS_PER_PAGE, (currentPage + 1) * AYAHS_PER_PAGE);
      if (pageAyahs.length > 0) {
        const last = pageAyahs[pageAyahs.length - 1];
        localStorage.setItem("quran-last-read", JSON.stringify({
          juz, ayahNumber: last.number, surahName: last.surah.englishName, numberInSurah: last.numberInSurah,
        }));
        recordReadingDay();
      }
    }
  }, [currentPage, ayahs, loading, juz]);

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
        if (arabicData.data?.ayahs) setAyahs(arabicData.data.ayahs);
        if (translationData.data?.ayahs) {
          const transMap: Record<number, string> = {};
          translationData.data.ayahs.forEach((a: any) => { transMap[a.number] = a.text; });
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

  useEffect(() => {
    if (!loading && ayahs.length > 0 && isBookmarkedJuz && bookmark && !hasScrolledToBookmark) {
      const idx = ayahs.findIndex(a => a.number === bookmark.ayahNumber);
      if (idx >= 0) {
        setCurrentPage(Math.floor(idx / AYAHS_PER_PAGE));
        setHasScrolledToBookmark(true);
        setTimeout(() => {
          bookmarkRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 400);
      }
    }
  }, [loading, ayahs, isBookmarkedJuz, bookmark, hasScrolledToBookmark]);

  const totalPages = Math.ceil(ayahs.length / AYAHS_PER_PAGE);
  const pageAyahs = ayahs.slice(currentPage * AYAHS_PER_PAGE, (currentPage + 1) * AYAHS_PER_PAGE);

  const bookmarkAyah = useCallback((ayah: Ayah) => {
    const bm: QuranBookmark = {
      juz, ayahNumber: ayah.number, surahNumber: ayah.surah.number,
      surahName: ayah.surah.englishName, surahArabic: ayah.surah.name,
      numberInSurah: ayah.numberInSurah, timestamp: Date.now(),
    };
    setBookmark(bm);
    localStorage.setItem("quran-bookmark-v2", JSON.stringify(bm));
    recordReadingDay();
  }, [juz]);

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

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setSwipeDirection(page > currentPage ? 1 : -1);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalPages, currentPage]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    } else if (info.offset.x < -threshold && currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const handleRequestNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setSwipeDirection(1);
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, totalPages]);

  const surahGroups: { surah: Ayah["surah"]; ayahs: Ayah[] }[] = [];
  pageAyahs.forEach((ayah) => {
    const last = surahGroups[surahGroups.length - 1];
    if (last && last.surah.number === ayah.surah.number) {
      last.ayahs.push(ayah);
    } else {
      surahGroups.push({ surah: ayah.surah, ayahs: [ayah] });
    }
  });

  useEffect(() => {
    if (playingAyah) {
      const el = document.getElementById(`ayah-${playingAyah}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [playingAyah]);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />

      {!loading && ayahs.length > 0 && (
        <QuranAudioPlayer
          ayahs={ayahs}
          currentPage={currentPage}
          ayahsPerPage={AYAHS_PER_PAGE}
          onAyahPlaying={setPlayingAyah}
          onRequestNextPage={handleRequestNextPage}
        />
      )}

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-3xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <Link to="/quran" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">All Juz</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {bookmark && (
              <button onClick={resumeBookmark} className="glass-card rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 hover:scale-105 transition-transform text-islamic-gold font-medium active:scale-95">
                <BookOpen size={14} />
                <span className="hidden sm:inline">Resume</span>
              </button>
            )}
            <button onClick={() => setShowTranslation(!showTranslation)} className="glass-card rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 hover:scale-105 transition-transform active:scale-95">
              {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">{showTranslation ? "Mushaf" : "Translation"}</span>
            </button>
          </div>
        </div>

        {bookmark && (
          <div className="mb-4 text-center">
            <p className="text-xs text-muted-foreground">
              📖 Bookmarked: {bookmark.surahName} ({bookmark.surahArabic}) — Ayah {bookmark.numberInSurah} · Juz {bookmark.juz}
            </p>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-islamic">Juz {juz}</h1>
          {totalPages > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Page {currentPage + 1} of {totalPages} · Swipe ← to turn page
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <>
            <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15} onDragEnd={handleDragEnd} className="touch-pan-y cursor-grab active:cursor-grabbing" dir="rtl">
              <AnimatePresence mode="wait" custom={swipeDirection}>
                <motion.div
                  key={`${currentPage}-${showTranslation}`}
                  custom={swipeDirection}
                  initial={{ opacity: 0, x: swipeDirection >= 0 ? -60 : 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: swipeDirection >= 0 ? 60 : -60 }}
                  transition={{ duration: 0.25 }}
                  dir="ltr"
                >
                  {showTranslation ? (
                    <div className="space-y-5">
                      {surahGroups.map((group) => (
                        <div key={`${group.surah.number}-${group.ayahs[0].numberInSurah}`} className="glass-card rounded-2xl p-4 sm:p-6">
                          <div className="text-center mb-4 pb-3 border-b border-border">
                            <p className="arabic-font text-xl text-islamic-gold">{group.surah.name}</p>
                            <p className="text-sm text-muted-foreground">{group.surah.englishName}</p>
                          </div>
                          <div className="space-y-4">
                            {group.ayahs.map((ayah) => {
                              const isBookmarked = bookmark?.ayahNumber === ayah.number;
                              const isAudioPlaying = playingAyah === ayah.number;
                              return (
                                <div
                                  key={ayah.number}
                                  id={`ayah-${ayah.number}`}
                                  ref={isBookmarked ? bookmarkRef : undefined}
                                  className={`pb-3 border-b border-border/50 last:border-0 relative group rounded-xl transition-all duration-300 ${
                                    isAudioPlaying ? "bg-primary/10 px-3 py-2 ring-1 ring-primary/20" :
                                    isBookmarked ? "bg-accent/10 px-3 py-2 ring-1 ring-accent/30" : ""
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
                                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                        {ayah.numberInSurah}
                                      </span>
                                      <button onClick={(e) => { e.stopPropagation(); bookmarkAyah(ayah); }} className="opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity p-1" title="Bookmark">
                                        <Bookmark size={12} className="text-muted-foreground hover:text-islamic-gold" />
                                      </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="arabic-font text-right text-xl sm:text-2xl leading-[2.2] mb-2">{ayah.text}</p>
                                      {translations[ayah.number] && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">{translations[ayah.number]}</p>
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
                    /* Mushaf-style page */
                    <div className="mushaf-page rounded-2xl p-5 sm:p-8 md:p-10 shadow-xl relative overflow-hidden border-2 border-islamic-gold/30 bg-[hsl(40,45%,96%)] dark:bg-[hsl(220,25%,15%)]">
                      {/* Decorative floral border */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-2 sm:inset-3 border-[3px] border-islamic-gold/25 rounded-xl" />
                        <div className="absolute inset-3 sm:inset-4 border border-islamic-gold/15 rounded-lg" />
                        {/* Corner ornaments */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-islamic-gold/40 rounded-tl-lg" />
                        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-islamic-gold/40 rounded-tr-lg" />
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-islamic-gold/40 rounded-bl-lg" />
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-islamic-gold/40 rounded-br-lg" />
                      </div>
                      {/* Lined paper effect (light mode only) */}
                      <div className="dark:hidden absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3rem, hsl(40,30%,60%) 3rem, hsl(40,30%,60%) 3.05rem)" }} />

                      {/* Surah headers */}
                      {surahGroups.map((group, gi) => (
                        <div key={`header-${group.surah.number}-${group.ayahs[0].numberInSurah}`}>
                          {(gi > 0 || group.ayahs[0].numberInSurah === 1) && (
                            <div className="my-5 text-center relative z-10">
                              <div className="inline-block bg-gradient-to-r from-islamic-gold/10 via-islamic-gold/20 to-islamic-gold/10 border-2 border-islamic-gold/30 rounded-2xl px-8 py-4 shadow-sm">
                                <p className="arabic-font text-2xl sm:text-3xl text-islamic-gold font-bold">{group.surah.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">{group.surah.englishName}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Ayah text with tajweed coloring */}
                      <div className="arabic-font text-right text-[1.6rem] sm:text-[1.9rem] md:text-[2.1rem] leading-[3.2] sm:leading-[3.6] relative z-10 select-text text-foreground dark:text-[hsl(40,30%,88%)]" dir="rtl" style={{ textAlign: "justify", textAlignLast: "center" }}>
                        {pageAyahs.map((ayah) => {
                          const isBookmarked = bookmark?.ayahNumber === ayah.number;
                          const isAudioPlaying = playingAyah === ayah.number;
                          return (
                            <span
                              key={ayah.number}
                              id={`ayah-${ayah.number}`}
                              ref={isBookmarked ? bookmarkRef : undefined}
                              className={`relative group/ayah cursor-pointer transition-all duration-300 ${
                                isAudioPlaying ? "bg-islamic-gold/25 dark:bg-islamic-gold/20 rounded-md px-1" :
                                isBookmarked ? "bg-primary/10 dark:bg-primary/15 rounded-md px-1" : "hover:bg-islamic-gold/10 rounded-md"
                              }`}
                              onClick={() => bookmarkAyah(ayah)}
                            >
                              {colorizeAyah(ayah.text)}{" "}
                              <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-islamic-gold text-sm sm:text-base mx-0.5 align-middle font-normal" style={{ fontFamily: "serif" }}>
                                ﴿{toArabicNum(ayah.numberInSurah)}﴾
                              </span>{" "}
                            </span>
                          );
                        })}
                      </div>

                      {/* Page number footer */}
                      <div className="text-center mt-6 relative z-10">
                        <span className="text-xs text-muted-foreground">{currentPage + 1}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Page navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    let pageIdx: number;
                    if (totalPages <= 10) {
                      pageIdx = i;
                    } else {
                      const start = Math.max(0, Math.min(currentPage - 4, totalPages - 10));
                      pageIdx = start + i;
                    }
                    return (
                      <button
                        key={pageIdx}
                        onClick={() => goToPage(pageIdx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          pageIdx === currentPage ? "bg-primary scale-125" : "bg-muted hover:bg-muted-foreground/30"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuranReader;
