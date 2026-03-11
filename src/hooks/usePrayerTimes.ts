import { useState, useEffect } from "react";

export interface PrayerTimesData {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface UsePrayerTimesResult {
  times: PrayerTimesData | null;
  city: string;
  loading: boolean;
  error: string | null;
  nextPrayerCountdown: string;
  nextPrayerName: string | null;
  currentPrayerName: string | null;
}

const PRAYER_NAMES: (keyof PrayerTimesData)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const parseTimeToMinutes = (timeStr: string): number => {
  const [time] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatCountdown = (diffMin: number): string => {
  if (diffMin <= 0) return "now";
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const usePrayerTimes = (): UsePrayerTimesResult => {
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTimes = async (lat: number, lng: number) => {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=2`
        );
        const data = await res.json();
        if (data.code === 200 && data.data?.timings) {
          const t = data.data.timings;
          setTimes({
            Fajr: t.Fajr,
            Dhuhr: t.Dhuhr,
            Asr: t.Asr,
            Maghrib: t.Maghrib,
            Isha: t.Isha,
          });
          // Try to get city name
          const meta = data.data.meta;
          if (meta?.timezone) {
            const parts = meta.timezone.split("/");
            setCity(parts[parts.length - 1].replace(/_/g, " "));
          }
        }
      } catch {
        setError("Could not fetch prayer times");
      }
      setLoading(false);
    };

    // Try saved location first
    const savedLoc = localStorage.getItem("user-location");
    if (savedLoc) {
      const { lat, lng, city: savedCity } = JSON.parse(savedLoc);
      if (savedCity) setCity(savedCity);
      fetchTimes(lat, lng);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, city: "" };
          localStorage.setItem("user-location", JSON.stringify(loc));
          fetchTimes(loc.lat, loc.lng);
        },
        () => {
          // Default to Makkah
          fetchTimes(21.4225, 39.8262);
          setCity("Makkah");
          setLoading(false);
        }
      );
    } else {
      fetchTimes(21.4225, 39.8262);
      setCity("Makkah");
    }
  }, []);

  // Calculate next prayer
  let nextPrayerName: string | null = null;
  let currentPrayerName: string | null = null;
  let nextPrayerCountdown = "";

  if (times) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < PRAYER_NAMES.length; i++) {
      const pMin = parseTimeToMinutes(times[PRAYER_NAMES[i]]);
      if (nowMin < pMin) {
        nextPrayerName = PRAYER_NAMES[i];
        nextPrayerCountdown = formatCountdown(pMin - nowMin);
        if (i > 0) currentPrayerName = PRAYER_NAMES[i - 1];
        break;
      }
    }

    if (!nextPrayerName) {
      currentPrayerName = "Isha";
      nextPrayerName = "Fajr";
      const fajrMin = parseTimeToMinutes(times.Fajr);
      const diff = (24 * 60 - nowMin) + fajrMin;
      nextPrayerCountdown = formatCountdown(diff);
    }
  }

  // Force re-render with tick
  void tick;

  return { times, city, loading, error, nextPrayerCountdown, nextPrayerName, currentPrayerName };
};
