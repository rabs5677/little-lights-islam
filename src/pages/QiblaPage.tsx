import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Compass, MapPin, AlertCircle } from "lucide-react";
import FloatingDecorations from "@/components/FloatingDecorations";

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

const getQiblaDirection = (lat: number, lng: number): number => {
  const phiK = toRad(KAABA_LAT);
  const lambdaK = toRad(KAABA_LNG);
  const phi = toRad(lat);
  const lambda = toRad(lng);
  const num = Math.sin(lambdaK - lambda);
  const den = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  let qibla = toDeg(Math.atan2(num, den));
  if (qibla < 0) qibla += 360;
  return qibla;
};

const QiblaPage = () => {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [hasCompass, setHasCompass] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [city, setCity] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Get location
  useEffect(() => {
    const savedLoc = localStorage.getItem("user-location");
    if (savedLoc) {
      const { lat, lng, city: c } = JSON.parse(savedLoc);
      setQiblaAngle(getQiblaDirection(lat, lng));
      if (c) setCity(c);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported. Using default location.");
      setQiblaAngle(getQiblaDirection(21.4225, 39.8262));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted.current) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, city: "" };
        localStorage.setItem("user-location", JSON.stringify(loc));
        setQiblaAngle(getQiblaDirection(loc.lat, loc.lng));
      },
      () => {
        if (!mounted.current) return;
        setLocationError("Location permission denied. Showing approximate direction.");
        setQiblaAngle(getQiblaDirection(21.4225, 39.8262));
      }
    );
  }, []);

  // Device orientation for compass
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      // @ts-ignore - webkitCompassHeading exists on iOS
      const heading = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
      if (heading != null) {
        setCompassHeading(heading);
        setHasCompass(true);
      }
    };

    // @ts-ignore
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      // iOS 13+
      // @ts-ignore
      DeviceOrientationEvent.requestPermission().then((res: string) => {
        if (res === "granted") window.addEventListener("deviceorientation", handler, true);
      }).catch(() => {});
    } else {
      window.addEventListener("deviceorientation", handler, true);
    }

    return () => window.removeEventListener("deviceorientation", handler, true);
  }, []);

  const needleRotation = qiblaAngle != null ? qiblaAngle - compassHeading : 0;

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Compass className="text-primary" size={28} />
            <h1 className="text-3xl font-bold text-gradient-islamic">Qibla Finder</h1>
          </div>
          <p className="text-muted-foreground text-sm">Find the direction of prayer toward Makkah</p>
          {city && (
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <MapPin size={12} /> {city}
            </div>
          )}
        </motion.div>

        {locationError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-3 mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle size={16} className="text-accent flex-shrink-0" />
            <span>{locationError}</span>
          </motion.div>
        )}

        {/* Compass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80">
            {/* Compass ring */}
            <div className="absolute inset-0 rounded-full glass-card border-2 border-primary/20 shadow-xl" />
            
            {/* Cardinal directions */}
            <div className="absolute inset-0" style={{ transform: `rotate(${-compassHeading}deg)`, transition: "transform 0.3s ease-out" }}>
              {["N", "E", "S", "W"].map((d, i) => (
                <div
                  key={d}
                  className="absolute text-sm font-bold text-muted-foreground"
                  style={{
                    top: i === 0 ? "8px" : i === 2 ? "auto" : "50%",
                    bottom: i === 2 ? "8px" : undefined,
                    left: i === 3 ? "8px" : i === 1 ? "auto" : "50%",
                    right: i === 1 ? "8px" : undefined,
                    transform: i === 0 || i === 2 ? "translateX(-50%)" : "translateY(-50%)",
                  }}
                >
                  <span style={{ transform: `rotate(${compassHeading}deg)`, display: "inline-block" }}>{d}</span>
                </div>
              ))}

              {/* Degree marks */}
              {Array.from({ length: 36 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 h-full"
                  style={{ transform: `rotate(${i * 10}deg)`, width: "1px" }}
                >
                  <div className={`w-px mx-auto ${i % 9 === 0 ? "h-4 bg-foreground/40" : "h-2 bg-foreground/15"}`} />
                </div>
              ))}
            </div>

            {/* Qibla needle */}
            {qiblaAngle != null && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${needleRotation}deg)`, transition: "transform 0.3s ease-out" }}
              >
                <div className="relative h-full flex flex-col items-center">
                  {/* Arrow pointing up (to Qibla) */}
                  <div className="mt-6">
                    <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
                      <path d="M12 0L22 30H2L12 0Z" fill="hsl(var(--islamic-gold))" />
                      <path d="M12 40L22 30H2L12 40Z" fill="hsl(var(--muted))" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Center Kaaba icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-background shadow-lg flex items-center justify-center border-2 border-islamic-gold/30">
                <span className="text-2xl">🕋</span>
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center font-medium text-foreground"
          >
            Face this direction for prayer
          </motion.p>

          {!hasCompass && (
            <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
              💡 For the best experience, open this page on a mobile device with compass support
            </p>
          )}

          {qiblaAngle != null && (
            <p className="text-xs text-muted-foreground mt-2">
              Qibla bearing: {Math.round(qiblaAngle)}° from North
            </p>
          )}
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5 mt-8"
        >
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span>🕌</span> How to use
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc ml-4">
            <li>Allow location access for accurate Qibla direction</li>
            <li>Hold your phone flat and face the direction of the golden arrow</li>
            <li>The arrow always points toward the Kaaba in Makkah</li>
            <li>Best used on a mobile device with compass sensor</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default QiblaPage;
