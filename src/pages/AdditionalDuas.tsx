import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import DuaCard from "@/components/DuaCard";
import FloatingDecorations from "@/components/FloatingDecorations";

const colors = ["#ce93d8", "#80cbc4", "#ffab91", "#81d4fa", "#a5d6a7", "#f48fb1", "#ffd54f", "#b39ddb"];

const additionalDuas = [
  {
    title: "Dua for Forgiveness",
    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakoonanna minal-khasireen",
    meaning: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers. (Quran 7:23)",
  },
  {
    title: "Dua for Protection",
    arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-lathee la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Samee'ul-'Aleem",
    meaning: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing.",
  },
  {
    title: "Dua for Parents",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir-hamhuma kama rabbayani sagheera",
    meaning: "My Lord, have mercy upon them as they brought me up when I was small. (Quran 17:24)",
  },
  {
    title: "Dua for Success",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliteration: "Rabbish-rahli sadri wa yassirli amri",
    meaning: "My Lord, expand for me my chest and ease for me my task. (Quran 20:25-26)",
  },
  {
    title: "Dua for Anxiety",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
    meaning: "O Allah, I seek refuge in You from worry and grief.",
  },
  {
    title: "Dua for Patience",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ",
    transliteration: "Rabbana afrigh 'alayna sabran wa tawaffana muslimeen",
    meaning: "Our Lord, pour upon us patience and let us die as Muslims. (Quran 7:126)",
  },
  {
    title: "Dua for Guidance",
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    transliteration: "Ihdinas-siratal-mustaqeem",
    meaning: "Guide us to the straight path. (Quran 1:6)",
  },
  {
    title: "Dua for Gratitude",
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
    transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya",
    meaning: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me. (Quran 27:19)",
  },
];

const AdditionalDuas = () => {
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">✨ Additional Duas</h1>
          <p className="text-muted-foreground">Powerful supplications from Quran and Sunnah</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
          {additionalDuas.map((dua, i) => (
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
        </div>
      </div>
    </div>
  );
};

export default AdditionalDuas;
