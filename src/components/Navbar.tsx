import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, BookOpen, HandHeart, Droplets, Compass, GraduationCap, Home } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/jannahpath-logo.png";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dua", label: "Dua", icon: HandHeart },
  { path: "/quran", label: "Quran", icon: BookOpen },
  { path: "/qibla", label: "Qibla", icon: Compass },
  { path: "/learn", label: "Learn", icon: GraduationCap },
  { path: "/cycle", label: "Care", icon: Droplets },
];

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border"
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-1">
          <img src={logo} alt="JannahPath" className="h-10 w-10 object-contain" />
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
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon size={16} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
