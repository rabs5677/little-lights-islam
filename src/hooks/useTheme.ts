import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("jannahpath-theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("jannahpath-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { theme, toggleTheme };
};
