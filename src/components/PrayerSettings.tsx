import { motion } from "framer-motion";
import { Bell, BellOff, Volume2, VolumeX, TestTube, Settings } from "lucide-react";

interface PrayerAlertSettings {
  notificationsEnabled: boolean;
  azaanEnabled: boolean;
  azaanType: "short" | "full";
}

interface Props {
  settings: PrayerAlertSettings;
  notifPermission: NotificationPermission;
  onUpdate: (partial: Partial<PrayerAlertSettings>) => void;
  onRequestPermission: () => void;
  onTestAzaan: () => void;
  onTestNotification: () => void;
}

const PrayerSettings = ({ settings, notifPermission, onUpdate, onRequestPermission, onTestAzaan, onTestNotification }: Props) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <Settings size={18} className="text-islamic-gold" />
      <h3 className="font-bold text-sm">Prayer Alert Settings</h3>
    </div>

    {/* Notifications toggle */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {settings.notificationsEnabled ? <Bell size={16} className="text-primary" /> : <BellOff size={16} className="text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium">Browser Notifications</p>
          <p className="text-[10px] text-muted-foreground">
            {notifPermission === "granted" ? "Permission granted" : notifPermission === "denied" ? "Permission denied" : "Click to enable"}
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          if (notifPermission !== "granted") {
            onRequestPermission();
          } else {
            onUpdate({ notificationsEnabled: !settings.notificationsEnabled });
          }
        }}
        className={`w-12 h-7 rounded-full transition-colors relative ${settings.notificationsEnabled && notifPermission === "granted" ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-background shadow transition-transform ${settings.notificationsEnabled && notifPermission === "granted" ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>

    {/* Azaan toggle */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {settings.azaanEnabled ? <Volume2 size={16} className="text-primary" /> : <VolumeX size={16} className="text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium">Azaan Audio</p>
          <p className="text-[10px] text-muted-foreground">Play when prayer time starts</p>
        </div>
      </div>
      <button
        onClick={() => onUpdate({ azaanEnabled: !settings.azaanEnabled })}
        className={`w-12 h-7 rounded-full transition-colors relative ${settings.azaanEnabled ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-background shadow transition-transform ${settings.azaanEnabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>

    {/* Azaan type */}
    {settings.azaanEnabled && (
      <div className="flex gap-2 pl-6">
        {(["short", "full"] as const).map((type) => (
          <button
            key={type}
            onClick={() => onUpdate({ azaanType: type })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${settings.azaanType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {type === "short" ? "Short Azaan" : "Full Azaan"}
          </button>
        ))}
      </div>
    )}

    {/* Test buttons */}
    <div className="flex gap-2 pt-2 border-t border-border">
      <button onClick={onTestNotification} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-xs font-medium hover:bg-muted/80 transition-colors">
        <TestTube size={12} /> Test Alert
      </button>
      <button onClick={onTestAzaan} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-xs font-medium hover:bg-muted/80 transition-colors">
        <Volume2 size={12} /> Test Azaan
      </button>
    </div>
  </motion.div>
);

export default PrayerSettings;
