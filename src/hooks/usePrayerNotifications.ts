import { useState, useEffect, useCallback, useRef } from "react";
import { usePrayerTimes } from "./usePrayerTimes";

interface PrayerAlertSettings {
  notificationsEnabled: boolean;
  azaanEnabled: boolean;
  azaanType: "short" | "full";
}

interface PrayerAlert {
  prayerName: string;
  visible: boolean;
}

const STORAGE_KEY = "jannahpath-prayer-settings";

const SHORT_AZAAN_URL = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3";
const FULL_AZAAN_URL = "https://www.islamcan.com/audio/adhan/azan1.mp3";

const loadSettings = (): PrayerAlertSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { notificationsEnabled: false, azaanEnabled: false, azaanType: "short" };
};

export const usePrayerNotifications = () => {
  const { times } = usePrayerTimes();
  const [settings, setSettings] = useState<PrayerAlertSettings>(loadSettings);
  const [alert, setAlert] = useState<PrayerAlert>({ prayerName: "", visible: false });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const lastAlertedRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      setSettings((s) => ({ ...s, notificationsEnabled: true }));
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<PrayerAlertSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  }, []);

  const dismissAlert = useCallback(() => {
    setAlert({ prayerName: "", visible: false });
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const testAzaan = useCallback(() => {
    const url = settings.azaanType === "full" ? FULL_AZAAN_URL : SHORT_AZAAN_URL;
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.play().catch(() => {});
    setTimeout(() => {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }, 5000);
  }, [settings.azaanType]);

  const testNotification = useCallback(() => {
    setAlert({ prayerName: "Maghrib", visible: true });
    if (notifPermission === "granted" && settings.notificationsEnabled) {
      new Notification("🕌 JannahPath — Prayer Time", {
        body: "It's time for Maghrib 🌙",
        icon: "/icon-192.png",
        tag: "prayer-test",
      });
    }
    setTimeout(() => setAlert({ prayerName: "", visible: false }), 6000);
  }, [notifPermission, settings.notificationsEnabled]);

  // Check prayer times every 30 seconds
  useEffect(() => {
    if (!times) return;

    const check = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const todayKey = now.toISOString().split("T")[0];

      const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
      for (const p of prayers) {
        const timeStr = times[p];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(":").map(Number);
        const pMin = h * 60 + m;

        // Alert if within 1 minute of prayer time
        if (Math.abs(nowMin - pMin) <= 1) {
          const alertKey = `${todayKey}-${p}`;
          if (lastAlertedRef.current === alertKey) continue;
          lastAlertedRef.current = alertKey;

          // In-app banner
          setAlert({ prayerName: p, visible: true });

          // Browser notification
          if (settings.notificationsEnabled && notifPermission === "granted") {
            try {
              new Notification("🕌 JannahPath — Prayer Time", {
                body: `It's time for ${p} 🌙`,
                icon: "/icon-192.png",
                tag: `prayer-${p}`,
              });
            } catch {}
          }

          // Azaan audio
          if (settings.azaanEnabled) {
            const url = settings.azaanType === "full" ? FULL_AZAAN_URL : SHORT_AZAAN_URL;
            if (!audioRef.current) audioRef.current = new Audio();
            audioRef.current.src = url;
            audioRef.current.play().catch(() => {});
          }

          // Auto-dismiss after 30 seconds
          setTimeout(() => setAlert({ prayerName: "", visible: false }), 30000);
          break;
        }
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [times, settings, notifPermission]);

  return {
    settings,
    updateSettings,
    alert,
    dismissAlert,
    notifPermission,
    requestPermission,
    testAzaan,
    testNotification,
  };
};
