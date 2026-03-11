import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DuaPage from "./pages/DuaPage";
import DailyDuas from "./pages/DailyDuas";
import AdditionalDuas from "./pages/AdditionalDuas";
import TasbeehPage from "./pages/TasbeehPage";
import QuranPage from "./pages/QuranPage";
import QuranReader from "./pages/QuranReader";
import CycleTracker from "./pages/CycleTracker";
import QiblaPage from "./pages/QiblaPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />

              <Route path="/dua" element={<DuaPage />} />
              <Route path="/dua/daily" element={<DailyDuas />} />
              <Route path="/dua/additional" element={<AdditionalDuas />} />
              <Route path="/dua/tasbeeh" element={<TasbeehPage />} />

              <Route path="/tasbeeh" element={<TasbeehPage />} />

              <Route path="/quran" element={<QuranPage />} />
              <Route path="/quran/:juzNumber" element={<QuranReader />} />

              <Route path="/qibla" element={<QiblaPage />} />

              <Route path="/cycle" element={<CycleTracker />} />
              <Route path="/care" element={<CycleTracker />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
