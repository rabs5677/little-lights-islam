import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
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
    keywords: ["forgiveness", "mercy", "sin"],
  },
  {
    title: "Dua for Protection",
    arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-lathee la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Samee'ul-'Aleem",
    meaning: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing.",
    keywords: ["protection", "safety", "harm"],
  },
  {
    title: "Dua for Parents",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir-hamhuma kama rabbayani sagheera",
    meaning: "My Lord, have mercy upon them as they brought me up when I was small. (Quran 17:24)",
    keywords: ["parents", "mercy", "family"],
  },
  {
    title: "Dua for Success",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliteration: "Rabbish-rahli sadri wa yassirli amri",
    meaning: "My Lord, expand for me my chest and ease for me my task. (Quran 20:25-26)",
    keywords: ["success", "ease", "task"],
  },
  {
    title: "Dua for Anxiety",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
    meaning: "O Allah, I seek refuge in You from worry and grief.",
    keywords: ["anxiety", "worry", "grief", "distress"],
  },
  {
    title: "Dua for Patience",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ",
    transliteration: "Rabbana afrigh 'alayna sabran wa tawaffana muslimeen",
    meaning: "Our Lord, pour upon us patience and let us die as Muslims. (Quran 7:126)",
    keywords: ["patience", "steadfastness"],
  },
  {
    title: "Dua for Guidance",
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    transliteration: "Ihdinas-siratal-mustaqeem",
    meaning: "Guide us to the straight path. (Quran 1:6)",
    keywords: ["guidance", "path", "direction"],
  },
  {
    title: "Dua for Gratitude",
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
    transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya",
    meaning: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me. (Quran 27:19)",
    keywords: ["gratitude", "thankfulness", "blessings"],
  },
  {
    title: "Dua When Entering a Town or City",
    arabic: "اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ، أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا",
    transliteration: "Allahumma Rabbas-samawatis-sab'i wa ma azlalna, wa Rabbal-aradeenas-sab'i wa ma aqlalna, wa Rabbash-shayateeni wa ma adlalna, wa Rabbar-riyahi wa ma dharayna, as'aluka khayra hathihil-qaryati wa khayra ahliha, wa a'udhu bika min sharriha wa sharri ahliha wa sharri ma fiha",
    meaning: "O Allah, Lord of the seven heavens and all they shade, Lord of the seven earths and all they bear, Lord of the devils and all they mislead, Lord of the winds and all they scatter, I ask You for the goodness of this town and the goodness of its people, and I seek refuge in You from its evil and the evil of its people.",
    keywords: ["town", "city", "travel", "entering"],
  },
  {
    title: "Dua for Namaz-e-Janaza",
    arabic: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ",
    transliteration: "Allahummaghfir lahu warhamhu wa 'afihi wa'fu 'anhu wa akrim nuzulahu wa wassi' mudkhalahu waghsilhu bil-ma'i wath-thalji wal-barad",
    meaning: "O Allah, forgive him, have mercy on him, grant him safety, pardon him, honour his reception, make his grave spacious, and wash him with water, snow and hail.",
    keywords: ["janaza", "funeral", "death", "deceased"],
  },
  {
    title: "Dua When Becoming Angry",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajeem",
    meaning: "I seek refuge in Allah from the accursed Satan.",
    keywords: ["anger", "angry", "rage", "temper"],
  },
  {
    title: "Dua When Looking at the Moon",
    arabic: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ رَبِّي وَرَبُّكَ اللَّهُ",
    transliteration: "Allahumma ahillahu 'alayna bil-yumni wal-iman was-salamati wal-Islam, Rabbi wa Rabbukallah",
    meaning: "O Allah, let this moon appear on us with blessings, faith, safety and Islam. My Lord and your Lord is Allah.",
    keywords: ["moon", "crescent", "new moon"],
  },
  {
    title: "Dua for Increase in Knowledge",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    meaning: "My Lord, increase me in knowledge. (Quran 20:114)",
    keywords: ["knowledge", "learning", "study", "wisdom"],
  },
  {
    title: "Dua Istikhara",
    arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ وَتَعْلَمُ وَلاَ أَعْلَمُ وَأَنْتَ عَلاَّمُ الْغُيُوبِ",
    transliteration: "Allahumma inni astakhiruka bi'ilmika, wa astaqdiruka biqudratika, wa as'aluka min fadlika al-'azim. Fa innaka taqdiru wa la aqdiru, wa ta'lamu wa la a'lamu, wa anta 'allamul-ghuyub",
    meaning: "O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty. You have power, I have none. You know, I know not. You are the Knower of hidden things.",
    keywords: ["istikhara", "decision", "guidance", "choice"],
  },
  {
    title: "Dua After Completing Wudu",
    arabic: "أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "Ash-hadu an la ilaha illallahu wahdahu la sharika lahu, wa ash-hadu anna Muhammadan 'abduhu wa rasuluhu",
    meaning: "I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and His Messenger.",
    keywords: ["wudu", "ablution", "purification"],
  },
  {
    title: "Dua in Rain",
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    transliteration: "Allahumma sayyiban nafi'a",
    meaning: "O Allah, make it a beneficial rain.",
    keywords: ["rain", "weather", "water"],
  },
  {
    title: "Dua at the Time of Distress",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    meaning: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers. (Quran 21:87)",
    keywords: ["distress", "difficulty", "hardship", "trouble", "crisis"],
  },
  {
    title: "Dua When Boarding a Vehicle",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-lathee sakhkhara lana hatha wa ma kunna lahu muqrineen wa inna ila Rabbina lamunqaliboon",
    meaning: "Glory to Him who has subjected this to us and we could never have it (by our efforts). And to our Lord, surely, we are to return. (Quran 43:13-14)",
    keywords: ["vehicle", "car", "travel", "transport", "boarding"],
  },
  {
    title: "Dua When Beginning a Journey",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى",
    transliteration: "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda",
    meaning: "O Allah, we ask You on this journey for righteousness, piety, and deeds that are pleasing to You.",
    keywords: ["journey", "travel", "trip", "voyage"],
  },
  {
    title: "Dua When Visiting the Sick",
    arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    transliteration: "La ba'sa, tahoorun in sha' Allah",
    meaning: "No harm, it is a purification, if Allah wills.",
    keywords: ["sick", "visiting", "illness", "hospital"],
  },
  {
    title: "Dua When You Are Sick",
    arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
    transliteration: "Allahumma Rabban-nas, adh-hibil-ba's, ishfi antash-Shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama",
    meaning: "O Allah, Lord of mankind, remove the difficulty and bring about healing as You are the Healer. There is no healing except Your healing, a healing that leaves no illness behind.",
    keywords: ["sick", "illness", "healing", "pain", "body pain", "health"],
  },
  {
    title: "Dua When Sustaining a Loss",
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    transliteration: "Inna lillahi wa inna ilaihi raji'oon. Allahumma ajurni fi musibati wa akhlif li khayran minha",
    meaning: "Indeed we belong to Allah, and indeed to Him we will return. O Allah, reward me in my calamity and replace it with something better.",
    keywords: ["loss", "calamity", "grief", "death"],
  },
  {
    title: "Dua When Seeing Someone in Distress",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا",
    transliteration: "Alhamdulillahil-lathee 'afani mimma-btalaaka bihi wa faddalani 'ala katheerin mimman khalaqa tafdeela",
    meaning: "All praise is for Allah who saved me from that which He has afflicted you with and has favoured me over many of those He has created.",
    keywords: ["distress", "affliction", "gratitude", "suffering"],
  },
  {
    title: "Dua at the Time of Sunset",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا يَلِجُ فِي اللَّيْلِ",
    transliteration: "Allahumma inni a'udhu bika min sharri ma yaliju fil-layl",
    meaning: "O Allah, I seek refuge in You from the evil that enters with the night.",
    keywords: ["sunset", "evening", "night"],
  },
  {
    title: "Dua at the Time of Sunrise",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Asbahna wa asbahal-mulku lillahi wal-hamdu lillahi la ilaha illallahu wahdahu la sharika lah",
    meaning: "We have reached the morning and the whole dominion belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah, alone, without partner.",
    keywords: ["sunrise", "morning", "dawn"],
  },
  {
    title: "Dua When Evil Thoughts Come",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-Shaytanir-Rajeem",
    meaning: "I seek refuge in Allah from Satan, the accursed.",
    keywords: ["evil thoughts", "whisper", "waswasa", "shaytan", "mind"],
  },
  {
    title: "Dua When Leaving Home",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
    transliteration: "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah",
    meaning: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.",
    keywords: ["leaving", "home", "going out"],
  },
  {
    title: "Dua for Body Pain",
    arabic: "أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
    transliteration: "A'udhu bi'izzatillahi wa qudratihi min sharri ma ajidu wa uhadhiru",
    meaning: "I seek refuge in the might of Allah and His power from the evil of what I feel and what I fear.",
    keywords: ["body pain", "pain", "ache", "hurt", "illness"],
  },
  {
    title: "Dua On Hearing Good News",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
    transliteration: "Alhamdulillahil-lathee bi ni'matihi tatimmus-salihat",
    meaning: "All praise is for Allah by whose grace all good things are completed.",
    keywords: ["good news", "happiness", "joy", "glad"],
  },
  {
    title: "Dua On Hearing Bad News",
    arabic: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
    transliteration: "Alhamdulillahi 'ala kulli hal",
    meaning: "All praise is for Allah in every condition.",
    keywords: ["bad news", "sadness", "grief", "calamity"],
  },
];

const AdditionalDuas = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDuas = useMemo(() => {
    if (!searchQuery.trim()) return additionalDuas;
    const q = searchQuery.toLowerCase().trim();
    return additionalDuas.filter(
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
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">✨ Additional Duas</h1>
          <p className="text-muted-foreground">Powerful supplications from Quran and Sunnah</p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search duas — distress, rain, anger, journey..."
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

export default AdditionalDuas;
