import { motion } from "framer-motion";

const FloatingDecorations = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-islamic-gold animate-twinkle"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${i * 0.4}s`,
            fontSize: `${8 + Math.random() * 12}px`,
          }}
        >
          ✦
        </motion.div>
      ))}
      {/* Crescent */}
      <div
        className="absolute top-20 right-10 text-4xl text-islamic-gold/30 animate-float-slow hidden md:block"
      >
        ☽
      </div>
      {/* Lantern shapes via CSS */}
      <div
        className="absolute bottom-20 left-10 w-6 h-10 rounded-full bg-islamic-gold/10 animate-float hidden md:block"
        style={{ borderRadius: "40% 40% 50% 50%" }}
      />
      <div
        className="absolute top-40 left-[20%] w-4 h-7 rounded-full bg-islamic-lavender/15 animate-float-slow hidden lg:block"
        style={{ borderRadius: "40% 40% 50% 50%", animationDelay: "1s" }}
      />
    </div>
  );
};

export default FloatingDecorations;
