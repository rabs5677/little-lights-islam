import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Home, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/jannahpath-logo.png";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { session, signOut } = useAuth();
  const isHome = location.pathname === "/";
  const isAuth = location.pathname === "/auth";

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border"
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="JannahPath" className="h-8 w-8 object-contain rounded-lg" />
          <span className="font-quicksand font-bold text-lg text-gradient-islamic">
            JannahPath
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {!isHome && !isAuth && (
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {session && !isAuth && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive transition-all"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
