import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

const GUIDANCE_ITEMS = [
  { icon: "🤲", title: "Make Dua", desc: "Talk to Allah — dua is always accepted." },
  { icon: "📿", title: "Do Tasbeeh", desc: "SubhanAllah, Alhamdulillah, Allahu Akbar — earn rewards easily." },
  { icon: "🌅", title: "Morning & Evening Adhkar", desc: "Recite the daily adhkar for protection and blessings." },
  { icon: "📖", title: "Read Quran Translation", desc: "You can read the meaning and tafsir of the Quran." },
  { icon: "🎧", title: "Listen to Quran Audio", desc: "Listening to Quran recitation is a beautiful act of worship." },
  { icon: "💚", title: "Do Astaghfaar", desc: "Seek forgiveness — it brings peace and barakah." },
  { icon: "🌿", title: "Reflect & Rest", desc: "Take care of yourself. Rest is also part of worship." },
];

const DHIKR_SUGGESTIONS = [
  {
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    count: "100 times",
    benefit: "Seeking forgiveness purifies the soul and brings mercy from Allah.",
  },
  {
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    count: "100 times",
    benefit: "A light phrase on the tongue but heavy on the scale of good deeds.",
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    count: "7 times",
    benefit: "Brings comfort, trust, and reliance on Allah during hardship.",
  },
  {
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    count: "Anytime",
    benefit: "The dua of Yunus (AS) — powerful for removing distress.",
  },
];

const CycleGuidance = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border-l-4" style={{ borderLeftColor: "hsl(var(--islamic-pink))" }}>
        <div className="flex items-start gap-3">
          <Heart className="text-islamic-pink flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
              Guidance for These Days
              <Sparkles size={14} className="text-islamic-gold" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              During these days, your prayers are paused but you can still earn beautiful rewards through remembrance, dua, and dhikr. 🤍
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {GUIDANCE_ITEMS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4 flex items-start gap-3"
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dhikr cards */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <span>📿</span> Suggested Dhikr
        </h3>
        <div className="space-y-3">
          {DHIKR_SUGGESTIONS.map((d, i) => (
            <motion.div
              key={d.transliteration}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="glass-card rounded-2xl p-4"
            >
              <p className="arabic-font text-right text-lg sm:text-xl mb-1">{d.arabic}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium text-primary">{d.transliteration}</p>
                <span className="text-xs bg-islamic-pink/20 text-foreground px-2 py-0.5 rounded-full">{d.count}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{d.benefit}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Supportive messages */}
      <div className="glass-card rounded-2xl p-5 text-center bg-islamic-pink/10">
        <p className="text-sm font-medium text-foreground mb-2">
          "These are days of ease. You can still earn reward through remembrance." 🌸
        </p>
        <p className="text-xs text-muted-foreground">
          Try Astaghfaar, Tasbeeh, and listening to Quran today.
        </p>
      </div>
    </motion.div>
  );
};

export default CycleGuidance;
