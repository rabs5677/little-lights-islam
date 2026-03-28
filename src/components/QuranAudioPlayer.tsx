import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, Volume2, Globe } from "lucide-react";

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: { englishName: string; name: string; number: number };
}

interface QuranAudioPlayerProps {
  ayahs: Ayah[];
  currentPage: number;
  ayahsPerPage: number;
  onAyahPlaying?: (ayahNumber: number | null) => void;
  onRequestNextPage?: () => void;
}

const QuranAudioPlayer = ({ ayahs, currentPage, ayahsPerPage, onAyahPlaying, onRequestNextPage }: QuranAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLang, setAudioLang] = useState<"ar" | "en">("ar");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoAdvanceRef = useRef(false);

  const totalPages = Math.ceil(ayahs.length / ayahsPerPage);
  const pageAyahs = ayahs.slice(currentPage * ayahsPerPage, (currentPage + 1) * ayahsPerPage);
  const currentAyah = pageAyahs[currentAyahIdx];

  const getAudioUrl = (ayahNumber: number) => {
    if (audioLang === "en") {
      return `https://cdn.islamic.network/quran/audio/128/en.walk/${ayahNumber}.mp3`;
    }
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
  };

  const loadAyah = useCallback((idx: number) => {
    if (idx < 0 || idx >= pageAyahs.length) return;
    setCurrentAyahIdx(idx);
    setProgress(0);
    const ayah = pageAyahs[idx];
    if (!ayah) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = getAudioUrl(ayah.number);
      audioRef.current.load();
    }
    onAyahPlaying?.(ayah.number);
  }, [pageAyahs, onAyahPlaying, audioLang]);

  useEffect(() => {
    setCurrentAyahIdx(0);
    setProgress(0);
    if (autoAdvanceRef.current) {
      autoAdvanceRef.current = false;
      const firstAyah = ayahs.slice(currentPage * ayahsPerPage, (currentPage + 1) * ayahsPerPage)[0];
      if (firstAyah && audioRef.current) {
        audioRef.current.src = getAudioUrl(firstAyah.number);
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        onAyahPlaying?.(firstAyah.number);
      }
    } else {
      onAyahPlaying?.(null);
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentPage]);

  // When language changes, reload current ayah
  useEffect(() => {
    if (currentAyah && audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = getAudioUrl(currentAyah.number);
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [audioLang]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentAyah) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        audioRef.current.src = getAudioUrl(currentAyah.number);
        audioRef.current.load();
      }
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      onAyahPlaying?.(currentAyah.number);
    }
  }, [isPlaying, currentAyah, onAyahPlaying, audioLang]);

  const playNext = useCallback(() => {
    const next = currentAyahIdx + 1;
    if (next < pageAyahs.length) {
      loadAyah(next);
      setTimeout(() => { audioRef.current?.play().catch(() => {}); setIsPlaying(true); }, 200);
    } else if (currentPage < totalPages - 1 && onRequestNextPage) {
      autoAdvanceRef.current = true;
      onRequestNextPage();
    } else {
      setIsPlaying(false);
      onAyahPlaying?.(null);
    }
  }, [currentAyahIdx, pageAyahs.length, loadAyah, onAyahPlaying, currentPage, totalPages, onRequestNextPage]);

  const replay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => { setProgress(audio.currentTime); setDuration(audio.duration || 0); };
    const onEnded = () => playNext();
    const onError = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => { audio.removeEventListener("timeupdate", onTimeUpdate); audio.removeEventListener("ended", onEnded); audio.removeEventListener("error", onError); };
  }, [playNext]);

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="auto" />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-14 z-40 glass-card border-b border-border shadow-md px-4 py-2.5">
        <div className="max-w-3xl mx-auto">
          <div className="w-full h-1 rounded-full bg-muted mb-2 cursor-pointer" onClick={e => {
            if (!audioRef.current || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
          }}>
            <motion.div className="h-full rounded-full bg-islamic-gold" style={{ width: `${progressPercent}%` }} transition={{ duration: 0.1 }} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Volume2 size={14} className="text-islamic-gold flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">
                  {currentAyah ? `${currentAyah.surah.englishName} — Ayah ${currentAyah.numberInSurah}` : "Select an ayah"}
                </p>
                <p className="text-[10px] text-muted-foreground">{audioLang === "ar" ? "Mishary Rashid Alafasy" : "Ibrahim Walk (English)"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setAudioLang(l => l === "ar" ? "en" : "ar")} className={`p-1.5 rounded-full transition-colors ${audioLang === "en" ? "bg-primary/15 text-primary" : "hover:bg-muted text-muted-foreground"}`} title="Toggle Arabic/English audio">
                <Globe size={14} />
              </button>
              <button onClick={replay} className="p-1.5 rounded-full hover:bg-muted transition-colors" title="Replay">
                <RotateCcw size={14} className="text-muted-foreground" />
              </button>
              <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md">
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              <button onClick={playNext} className="p-1.5 rounded-full hover:bg-muted transition-colors" title="Next ayah">
                <SkipForward size={14} className="text-muted-foreground" />
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground text-right flex-shrink-0">{currentAyahIdx + 1}/{pageAyahs.length}</div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default QuranAudioPlayer;
