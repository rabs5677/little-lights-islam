import { Link, useLocation } from "react-router-dom";
import { Moon, BookOpen, HandHeart } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/jannahpath-logo.png";

const navItems = [
  { path: "/", label: "Home", icon: Moon },
  { path: "/dua", label: "Dua", icon: HandHeart },
  { path: "/quran", label: "Quran", icon: BookOpen },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20"
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-islamic-pink flex items-center justify-center">
            <span className="text-primary-foreground text-lg">☪</span>
          </div>
          <span className="font-quicksand font-bold text-lg text-gradient-islamic hidden sm:block">
            JannahPath
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-islamic-mint hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
