import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Target } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

const SUGGESTIONS = [
  { text: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", benefit: "Helps in seeking forgiveness and purification of sins.", target: 100 },
  { text: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", benefit: "Increases remembrance of Allah and brings peace to the heart.", target: 100 },
  { text: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", benefit: "Builds gratitude and brings barakah.", target: 100 },
  { text: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", benefit: "Strengthens faith and humility.", target: 100 },
  { text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin", benefit: "Helpful in distress and difficult situations.", target: 33 },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", benefit: "A beloved dhikr with great rewards.", target: 100 },
  { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallahu wa ni'mal wakeel", benefit: "Gives comfort and trust in Allah in hardship.", target: 33 },
];

const ENCOURAGEMENT = [
  "Keep going, Allah loves consistency 💚",
  "You're doing great! 🌙",
  "Every count matters ✨",
  "SubhanAllah, keep it up! 🤲",
];

const NEAR_END = [
  "Almost there! You can do it! 🎉",
  "Just a few more! 💫",
  "MashaAllah, nearly done! ✨",
];

const TasbeehPage = () => {
  const [target, setTarget] = useState<number>(0);
  const [customTarget, setCustomTarget] = useState("");
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const remaining = Math.max(0, target - count);
  const progress = target > 0 ? Math.min(100, (count / target) * 100) : 0;

  const handleCount = useCallback(() => {
    if (completed) return;
    const next = count + 1;
    setCount(next);
    if (next >= target) setCompleted(true);
  }, [count, target, completed]);

  const reset = () => {
    setCount(0);
    setCompleted(false);
  };

  const startWithTarget = (t: number) => {
    setTarget(t);
    setCount(0);
    setCompleted(false);
  };

  const getMessage = () => {
    if (completed) return "MashaAllah! You made it! 🤲✨\nWell done! Keep your heart connected with Allah.";
    if (progress > 80) return NEAR_END[count % NEAR_END.length];
    return ENCOURAGEMENT[count % ENCOURAGEMENT.length];
  };

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
        <Link to="/dua" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Dua</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-islamic mb-2">📿 Tasbeeh Counter</h1>
          <p className="text-muted-foreground">Count your dhikr with peace and focus</p>
        </motion.div>

        {target === 0 ? (
          /* Target selection */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 text-center">
              <Target className="mx-auto mb-3 text-islamic-gold" size={32} />
              <h2 className="font-bold text-lg mb-4">Set Your Target</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[33, 100, 500, 1000].map((t) => (
                  <button
                    key={t}
                    onClick={() => startWithTarget(t)}
                    className="glass-card rounded-xl py-3 font-bold text-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="Custom..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => { const n = parseInt(customTarget); if (n > 0) startWithTarget(n); }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  Start
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Counter view */
          <div className="space-y-6">
            {/* Animated boy with board */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-end gap-3 max-w-sm mx-auto"
            >
              <div className="flex-shrink-0">
                <svg width="52" height="68" viewBox="0 0 52 68" fill="none" className="drop-shadow-md">
                  {/* Topi / cap */}
                  <ellipse cx="26" cy="10" rx="12" ry="6" fill="hsl(var(--primary))" />
                  <rect x="14" y="10" width="24" height="4" rx="2" fill="hsl(var(--primary))" />
                  {/* Head */}
                  <circle cx="26" cy="20" r="10" fill="hsl(40 40% 88%)" />
                  {/* Kurta body */}
                  <path d="M12 34 C12 28 40 28 40 34 L42 64 C42 66 10 66 10 64 Z" fill="hsl(var(--primary))" />
                  {/* Hands */}
                  <ellipse cx="14" cy="46" rx="4" ry="3" fill="hsl(40 40% 86%)" />
                  <ellipse cx="38" cy="46" rx="4" ry="3" fill="hsl(40 40% 86%)" />
                </svg>
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-center text-islamic-gold text-xs -mt-1">✦</motion.div>
              </div>
              <motion.div
                key={count}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="glass-card rounded-2xl rounded-bl-sm px-4 py-3 border border-primary/20 shadow-md relative"
              >
                <p className="text-sm font-quicksand font-medium whitespace-pre-line leading-relaxed">{getMessage()}</p>
                <div className="absolute bottom-3 -left-2 w-3 h-3 bg-white/70 border-l border-b border-primary/20 rotate-45" />
              </motion.div>
            </motion.div>

            {/* Counter circle */}
            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                {completed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl mb-4"
                  >
                    🎉✨🤲
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleCount}
                disabled={completed}
                whileTap={{ scale: 0.92 }}
                className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center shadow-xl transition-all ${
                  completed ? "glow-gold" : "glass-card hover:shadow-2xl active:shadow-inner"
                }`}
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <motion.circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke="hsl(var(--islamic-gold))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ strokeDasharray: `${(progress / 100) * 283} 283` }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <div className="text-center z-10">
                  <motion.span
                    key={count}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-4xl sm:text-5xl font-bold block"
                  >
                    {count}
                  </motion.span>
                  <span className="text-xs text-muted-foreground block mt-1">of {target}</span>
                </div>
              </motion.button>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-muted-foreground">{remaining} remaining</span>
                <button onClick={reset} className="p-2 rounded-xl glass-card hover:scale-105 transition-transform" title="Reset">
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => { setTarget(0); setCount(0); setCompleted(false); }}
                  className="text-xs text-muted-foreground underline"
                >
                  Change target
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dhikr suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <h2 className="font-bold text-lg mb-4 text-center">📿 Dhikr Suggestions & Benefits</h2>
          <div className="space-y-3">
            {SUGGESTIONS.map((s, i) => (
              <motion.div
                key={s.transliteration}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card rounded-2xl p-4"
              >
                <p className="arabic-font text-right text-lg sm:text-xl mb-1">{s.text}</p>
                <p className="text-sm font-medium text-primary">{s.transliteration} — {s.target}×</p>
                <p className="text-xs text-muted-foreground mt-1">{s.benefit}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TasbeehPage;
