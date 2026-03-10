import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";
import DuaCard from "@/components/DuaCard";
import FloatingDecorations from "@/components/FloatingDecorations";

const colors = ["#5bb5a2", "#b39ddb", "#81d4fa", "#f48fb1", "#ffd54f", "#a5d6a7", "#ffab91", "#ce93d8", "#80cbc4", "#fff176"];

const dailyDuas = [
  { title: "Dua When Waking Up", arabic: "الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdu lillahil-lathee ahyana ba'da ma amatana wa ilayhin-nushoor", meaning: "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.", keywords: ["waking", "morning", "sleep"] },
  { title: "Dua Before Sleeping", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amootu wa ahya", meaning: "In Your name, O Allah, I die and I live.", keywords: ["sleeping", "night", "bed"] },
  { title: "Dua Before Eating", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", transliteration: "Bismillahi wa 'ala barakatillah", meaning: "In the name of Allah and with the blessings of Allah.", keywords: ["eating", "food", "meal"] },
  { title: "Dua After Eating", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", transliteration: "Alhamdu lillahil-lathee at'amana wa saqana wa ja'alana muslimeen", meaning: "All praise is for Allah who fed us, gave us drink, and made us Muslims.", keywords: ["eating", "food", "meal", "after"] },
  { title: "Dua When Leaving the House", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ", transliteration: "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah", meaning: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.", keywords: ["leaving", "home", "house", "going out"] },
  { title: "Dua When Entering the House", arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا", transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna", meaning: "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we place our trust.", keywords: ["entering", "home", "house"] },
  { title: "Dua Before Entering the Washroom", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith", meaning: "O Allah, I seek refuge in You from evil and evil ones.", keywords: ["washroom", "bathroom", "toilet"] },
  { title: "Dua After Leaving the Washroom", arabic: "غُفْرَانَكَ", transliteration: "Ghufranaka", meaning: "I ask You (Allah) for forgiveness.", keywords: ["washroom", "bathroom", "toilet"] },
  { title: "Dua Before Studying", arabic: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا", transliteration: "Allahumma infa'ni bima 'allamtani wa 'allimni ma yanfa'uni wa zidni 'ilma", meaning: "O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.", keywords: ["studying", "study", "knowledge", "learning", "exam"] },
  { title: "Dua for Seeking Knowledge", arabic: "رَبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidni 'ilma", meaning: "My Lord, increase me in knowledge.", keywords: ["knowledge", "learning", "wisdom"] },
];

const DailyDuas = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDuas = useMemo(() => {
    if (!searchQuery.trim()) return dailyDuas;
    const q = searchQuery.toLowerCase().trim();
    return dailyDuas.filter(
      (dua) =>
        dua.title.toLowerCase().includes(q) ||
        dua.meaning.toLowerCase().includes(q) ||
        dua.transliteration.toLowerCase().includes(q) ||
        dua.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <Link to="/dua" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Dua Library</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">🌙 Daily Duas</h1>
          <p className="text-muted-foreground">Essential supplications for everyday life</p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search duas — eating, sleeping, home..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
          {filteredDuas.map((dua, i) => (
            <DuaCard
              key={dua.title}
              title={dua.title}
              arabic={dua.arabic}
              transliteration={dua.transliteration}
              meaning={dua.meaning}
              index={i}
              color={colors[i % colors.length]}
            />
          ))}
          {filteredDuas.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No duas found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyDuas;
