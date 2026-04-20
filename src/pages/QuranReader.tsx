import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, BookOpen, Eye, EyeOff, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";
import QuranAudioPlayer from "@/components/QuranAudioPlayer";
import { addXP, recordActivity } from "@/lib/gamification";

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
    addXP(10);
    recordActivity("quran");
  }
};

// Tajweed-like coloring
const colorizeAyah = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const chars = [...text];
  const noonChars = new Set(["ً", "ٌ", "ٍ"]);
  const maddLetters = new Set(["ا", "و", "ي", "ى"]);
  const shaddah = "ّ";
  const ghunnaLetters = new Set(["ن", "م"]);

  for (let idx = 0; idx < chars.length; idx++) {
    const ch = chars[idx];
    const next = chars[idx + 1] || "";
    const prev = chars[idx - 1] || "";

    if (ch === shaddah) {
      parts.push(<span key={idx} className="text-[hsl(0,70%,55%)] dark:text-[hsl(0,80%,65%)]">{ch}</span>);
    } else if (noonChars.has(ch)) {
      parts.push(<span key={idx} className="text-[hsl(140,60%,40%)] dark:text-[hsl(140,70%,55%)]">{ch}</span>);
    } else if (ghunnaLetters.has(ch) && (next === "ْ" || next === shaddah)) {
      parts.push(<span key={idx} className="text-[hsl(210,70%,50%)] dark:text-[hsl(210,80%,65%)]">{ch}</span>);
    } else if (maddLetters.has(ch) && (prev === "َ" || prev === "ِ" || prev === "ُ")) {
      parts.push(<span key={idx} className="text-[hsl(320,60%,50%)] dark:text-[hsl(320,70%,65%)]">{ch}</span>);
    } else {
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [bookmark, setBookmark] = useState<QuranBookmark | null>(() => {
    const saved = localStorage.getItem("quran-bookmark-v2");
    return saved ? JSON.parse(saved) : null;
  });

  const isBookmarkedJuz = bookmark?.juz === juz;

  // Fetch quran data
  useEffect(() => {
    const fetchQuran = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [arabicRes, translationRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/juz/${juz}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/juz/${juz}/en.asad`),
        ]);
        if (!arabicRes.ok) throw new Error(`Arabic fetch failed: ${arabicRes.status}`);
        const arabicData = await arabicRes.json();
        const translationData = translationRes.ok ? await translationRes.json() : null;
        if (arabicData?.data?.ayahs?.length) {
          setAyahs(arabicData.data.ayahs);
        } else {
          throw new Error("No ayahs returned from API");
        }
        if (translationData?.data?.ayahs) {
          const transMap: Record<number, string> = {};
          translationData.data.ayahs.forEach((a: any) => { transMap[a.number] = a.text; });
          setTranslations(transMap);
        }
      } catch (err: any) {
        console.error("Failed to fetch Quran data:", err);
        setLoadError(err?.message || "Failed to load Quran data");
      }
      setLoading(false);
    };
    fetchQuran();
  }, [juz]);

  const totalPages = ayahs.length > 0 ? Math.ceil(ayahs.length / AYAHS_PER_PAGE) : 0;
  // Reset refs when ayahs load
  useEffect(() => {
    pageRefs.current = new Array(totalPages).fill(null);
  }, [totalPages]);

  // After load, scroll to bookmark page if matching juz
  useEffect(() => {
    if (loading || ayahs.length === 0) return;
    if (isBookmarkedJuz && bookmark) {
      const idx = ayahs.findIndex(a => a.number === bookmark.ayahNumber);
      if (idx >= 0) {
        const targetPage = Math.floor(idx / AYAHS_PER_PAGE);
        setCurrentPage(targetPage);
        setTimeout(() => {
          pageRefs.current[targetPage]?.scrollIntoView({ behavior: "auto", block: "start" });
        }, 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, ayahs.length]);

  // IntersectionObserver to track current page from scroll
  useEffect(() => {
    if (totalPages === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const idx = parseInt((entry.target as HTMLElement).dataset.page || "0", 10);
            setCurrentPage(idx);
            recordReadingDay();
            // Save last read
            const pageAyahs = ayahs.slice(idx * AYAHS_PER_PAGE, (idx + 1) * AYAHS_PER_PAGE);
            if (pageAyahs.length) {
              const last = pageAyahs[pageAyahs.length - 1];
              localStorage.setItem("quran-last-read", JSON.stringify({
                juz, ayahNumber: last.number, surahName: last.surah.englishName, numberInSurah: last.numberInSurah,
              }));
            }
          }
        });
      },
      { threshold: [0.55] }
    );
    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [totalPages, ayahs, juz]);

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

  const goToPage = useCallback((page: number) => {
    if (page < 0 || page >= totalPages) return;
    pageRefs.current[page]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [totalPages]);

  // Triggered by audio player when last ayah of page finishes — auto-scroll to next
  const handleRequestNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  // Group ayahs by page
  const pages = Array.from({ length: totalPages }, (_, i) =>
    ayahs.slice(i * AYAHS_PER_PAGE, (i + 1) * AYAHS_PER_PAGE)
  );

  return (
    <div className="relative min-h-screen pb-4">
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

      {/* Top bar */}
      <div className="container mx-auto px-4 pt-4 max-w-3xl flex items-center justify-between gap-2 flex-wrap relative z-10">
        <Link to="/quran" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">All Juz</span>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground hidden sm:inline">Juz {juz}</span>
          {totalPages > 0 && (
            <span className="text-xs font-medium text-muted-foreground">Page {currentPage + 1}/{totalPages}</span>
          )}
          <button onClick={() => setShowTranslation(!showTranslation)} className="glass-card rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 hover:scale-105 transition-transform active:scale-95">
            {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{showTranslation ? "Mushaf" : "Translation"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <>
          {/* Reels-style snap scroll container */}
          <div
            ref={scrollContainerRef}
            className="snap-y snap-mandatory overflow-y-auto"
            style={{ height: "calc(100vh - 9.5rem)", scrollBehavior: "smooth" }}
          >
            {pages.map((pageAyahs, pageIdx) => {
              const surahGroups: { surah: Ayah["surah"]; ayahs: Ayah[] }[] = [];
              pageAyahs.forEach((ayah) => {
                const last = surahGroups[surahGroups.length - 1];
                if (last && last.surah.number === ayah.surah.number) {
                  last.ayahs.push(ayah);
                } else {
                  surahGroups.push({ surah: ayah.surah, ayahs: [ayah] });
                }
              });

              return (
                <div
                  key={pageIdx}
                  ref={(el) => (pageRefs.current[pageIdx] = el)}
                  data-page={pageIdx}
                  className="snap-start min-h-full flex items-center justify-center px-4 py-4"
                  style={{ minHeight: "calc(100vh - 9.5rem)" }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-3xl"
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
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-2 sm:inset-3 border-[3px] border-islamic-gold/25 rounded-xl" />
                          <div className="absolute inset-3 sm:inset-4 border border-islamic-gold/15 rounded-lg" />
                          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-islamic-gold/40 rounded-tl-lg" />
                          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-islamic-gold/40 rounded-tr-lg" />
                          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-islamic-gold/40 rounded-bl-lg" />
                          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-islamic-gold/40 rounded-br-lg" />
                        </div>
                        <div className="dark:hidden absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3rem, hsl(40,30%,60%) 3rem, hsl(40,30%,60%) 3.05rem)" }} />

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

                        <div className="arabic-font text-right text-[1.6rem] sm:text-[1.9rem] md:text-[2.1rem] leading-[3.2] sm:leading-[3.6] relative z-10 select-text text-foreground dark:text-[hsl(40,30%,88%)]" dir="rtl" style={{ textAlign: "justify", textAlignLast: "center" }}>
                          {pageAyahs.map((ayah) => {
                            const isBookmarked = bookmark?.ayahNumber === ayah.number;
                            const isAudioPlaying = playingAyah === ayah.number;
                            return (
                              <span
                                key={ayah.number}
                                id={`ayah-${ayah.number}`}
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

                        <div className="text-center mt-6 relative z-10">
                          <span className="text-xs text-muted-foreground">Page {pageIdx + 1} · Juz {juz}</span>
                        </div>
                      </div>
                    )}

                    {/* Scroll hint */}
                    {pageIdx < totalPages - 1 && (
                      <div className="text-center mt-3 text-muted-foreground/60 text-xs flex items-center justify-center gap-1 animate-bounce">
                        <ChevronDown size={14} /> Scroll for next page
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Floating prev/next buttons */}
          {totalPages > 1 && (
            <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-full glass-card shadow-lg flex items-center justify-center disabled:opacity-30 hover:scale-110 active:scale-95 transition-transform"
                aria-label="Previous page"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="w-10 h-10 rounded-full glass-card shadow-lg flex items-center justify-center disabled:opacity-30 hover:scale-110 active:scale-95 transition-transform"
                aria-label="Next page"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuranReader;
