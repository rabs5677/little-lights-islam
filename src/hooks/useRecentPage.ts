import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PAGE_LABELS: Record<string, string> = {
  "/namaz": "Namaz Tracker",
  "/quran": "Quran",
  "/dua": "Dua Library",
  "/learn": "Learn Islam",
  "/qibla": "Qibla Finder",
  "/cycle": "Women Care",
  "/tasbeeh": "Tasbeeh Counter",
};

export const useRecentPage = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    // Only track top-level pages, not home
    const base = "/" + path.split("/")[1];
    if (base !== "/" && PAGE_LABELS[base]) {
      localStorage.setItem(
        "jannahpath-recent-page",
        JSON.stringify({ path, label: PAGE_LABELS[base] })
      );
    }
  }, [location.pathname]);
};
