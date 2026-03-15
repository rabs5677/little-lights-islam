import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Filter, X } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

interface VideoItem {
  id: string;
  title: string;
  speaker: string;
  category: string[];
}

const CATEGORIES = [
  "All", "Mufti Menk", "Dr Israr Ahmed", "Prophet Stories",
  "Hadith", "Islamic Laws", "Motivational", "Kids Stories",
];

// All IDs verified as embeddable YouTube videos
const VIDEOS: VideoItem[] = [
  // Mufti Menk
  { id: "9ThtdIBfZ3g", title: "Contentment — The Key to Happiness", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"] },
  { id: "Ow5fkOhR0Vw", title: "Dealing With Anxiety and Stress", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"] },
  { id: "xkq-JBY3Elg", title: "The Power of Repentance", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"] },
  { id: "cRadKf4YKWU", title: "Kindness Changes Everything", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"] },
  { id: "Qs1TE1U0f_4", title: "Control Your Anger", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"] },
  { id: "3tx5EMhpxno", title: "Beautiful Hadith on Kindness", speaker: "Mufti Menk", category: ["Hadith", "Mufti Menk"] },

  // Dr Israr Ahmed
  { id: "bCkfkZ43Fyk", title: "Importance of Quran in Our Lives", speaker: "Dr Israr Ahmed", category: ["Dr Israr Ahmed", "Islamic Laws"] },
  { id: "jQaZufGnQ7g", title: "Understanding Surah Al-Fatiha", speaker: "Dr Israr Ahmed", category: ["Dr Israr Ahmed", "Islamic Laws"] },
  { id: "OaBz3alNIzk", title: "Purpose of Life in Islam", speaker: "Dr Israr Ahmed", category: ["Dr Israr Ahmed", "Motivational"] },

  // Prophet Stories
  { id: "0WCLk-FQ3Xg", title: "Story of Prophet Muhammad ﷺ", speaker: "Islamic History", category: ["Prophet Stories"] },
  { id: "yp_TH02gfwk", title: "Story of Prophet Ibrahim (AS)", speaker: "Islamic History", category: ["Prophet Stories"] },
  { id: "WEaPSH0YI-E", title: "Story of Prophet Musa (AS)", speaker: "Islamic History", category: ["Prophet Stories"] },
  { id: "rDEQA4JoFao", title: "Story of Prophet Yusuf (AS)", speaker: "Islamic History", category: ["Prophet Stories"] },
  { id: "Pq1MqJfJexM", title: "Story of Prophet Isa (AS)", speaker: "Islamic History", category: ["Prophet Stories"] },

  // Hadith
  { id: "LQ3bSiMBv2o", title: "40 Hadith of Imam Nawawi", speaker: "Islamic Scholars", category: ["Hadith"] },

  // Kids Stories
  { id: "1-YRhNpbWp0", title: "Be Honest – Islamic Story for Kids", speaker: "Kids Islamic", category: ["Kids Stories"] },
  { id: "APkWjnOS-IU", title: "The Importance of Prayer – Kids", speaker: "Kids Islamic", category: ["Kids Stories"] },
  { id: "hLwFNq1BLdk", title: "Kindness in Islam – Kids Story", speaker: "Kids Islamic", category: ["Kids Stories"] },
];

const LearnIslamPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return VIDEOS;
    return VIDEOS.filter((v) => v.category.includes(activeCategory));
  }, [activeCategory]);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">📚 Learn Islam</h1>
          <p className="text-muted-foreground">Authentic Islamic knowledge, stories & lectures</p>
        </motion.div>

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <Filter size={16} className="text-muted-foreground flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPlayingVideo(null); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Full-screen in-app player */}
        {playingVideo && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="relative aspect-video bg-foreground/5">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playingVideo}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  title="Video player"
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <p className="text-sm font-medium truncate">
                  {VIDEOS.find((v) => v.id === playingVideo)?.title}
                </p>
                <button onClick={() => setPlayingVideo(null)} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setPlayingVideo(video.id)}
                className="relative w-full aspect-video bg-muted group"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center group-hover:bg-foreground/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Play size={20} className="ml-0.5" />
                  </div>
                </div>
              </button>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-xs text-muted-foreground">{video.speaker}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {video.category.map((c) => (
                    <span key={c} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No videos found for this category</div>
        )}
      </div>
    </div>
  );
};

export default LearnIslamPage;
