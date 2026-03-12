import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Filter } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

interface VideoItem {
  id: string;
  title: string;
  speaker: string;
  category: string[];
  thumbnail: string;
}

const CATEGORIES = [
  "All",
  "Mufti Menk",
  "Dr Israr Ahmed",
  "Prophet Stories",
  "Hadith",
  "Islamic Laws",
  "Motivational",
  "Kids Stories",
];

const VIDEOS: VideoItem[] = [
  // Mufti Menk
  { id: "dqz9BxPRXck", title: "Finding Peace Through Patience", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"], thumbnail: "" },
  { id: "8JMxqsCFmfo", title: "The Power of Forgiveness", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"], thumbnail: "" },
  { id: "zO0WoH2PGAE", title: "Trust in Allah's Plan", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"], thumbnail: "" },
  { id: "RKFjKvCusXQ", title: "Building Good Character", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"], thumbnail: "" },
  { id: "fB8L2YBnk0U", title: "Daily Reminders for Believers", speaker: "Mufti Menk", category: ["Mufti Menk", "Motivational"], thumbnail: "" },
  // Dr Israr Ahmed
  { id: "I50UB9gMy9s", title: "Understanding the Quran", speaker: "Dr Israr Ahmed", category: ["Dr Israr Ahmed", "Islamic Laws"], thumbnail: "" },
  { id: "Gx0j7nOPojo", title: "Philosophy of Islam", speaker: "Dr Israr Ahmed", category: ["Dr Israr Ahmed", "Islamic Laws"], thumbnail: "" },
  { id: "8V2VHWz98lI", title: "Quran and Modern Life", speaker: "Dr Israr Ahmed", category: ["Dr Israr Ahmed", "Motivational"], thumbnail: "" },
  // Prophet Stories
  { id: "0WCLk-FQ3Xg", title: "Story of Prophet Muhammad ﷺ", speaker: "Islamic History", category: ["Prophet Stories"], thumbnail: "" },
  { id: "yp_TH02gfwk", title: "Story of Prophet Ibrahim (AS)", speaker: "Islamic History", category: ["Prophet Stories"], thumbnail: "" },
  { id: "WEaPSH0YI-E", title: "Story of Prophet Musa (AS)", speaker: "Islamic History", category: ["Prophet Stories"], thumbnail: "" },
  { id: "rDEQA4JoFao", title: "Story of Prophet Yusuf (AS)", speaker: "Islamic History", category: ["Prophet Stories"], thumbnail: "" },
  { id: "Pq1MqJfJexM", title: "Story of Prophet Isa (AS)", speaker: "Islamic History", category: ["Prophet Stories"], thumbnail: "" },
  // Hadith
  { id: "LQ3bSiMBv2o", title: "40 Hadith of Imam Nawawi", speaker: "Islamic Scholars", category: ["Hadith"], thumbnail: "" },
  { id: "3tx5EMhpxno", title: "Hadith on Kindness", speaker: "Mufti Menk", category: ["Hadith", "Mufti Menk"], thumbnail: "" },
  // Kids Stories
  { id: "1-YRhNpbWp0", title: "Be Honest – Islamic Story for Kids", speaker: "Kids Islamic", category: ["Kids Stories"], thumbnail: "" },
  { id: "APkWjnOS-IU", title: "The Importance of Prayer – Kids", speaker: "Kids Islamic", category: ["Kids Stories"], thumbnail: "" },
  { id: "hLwFNq1BLdk", title: "Kindness in Islam – Kids Story", speaker: "Kids Islamic", category: ["Kids Stories"], thumbnail: "" },
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
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Home</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">📚 Learn Islam</h1>
          <p className="text-muted-foreground">Authentic Islamic knowledge, stories & lectures</p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <Filter size={16} className="text-muted-foreground flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {playingVideo === video.id ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={video.title}
                  />
                </div>
              ) : (
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
              )}
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
          <div className="text-center py-12 text-muted-foreground">
            No videos found for this category
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnIslamPage;
