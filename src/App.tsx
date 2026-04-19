import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import DuaPage from "./pages/DuaPage";
import DailyDuas from "./pages/DailyDuas";
import AdditionalDuas from "./pages/AdditionalDuas";
import TasbeehPage from "./pages/TasbeehPage";
import QuranPage from "./pages/QuranPage";
import QuranReader from "./pages/QuranReader";
import CycleTracker from "./pages/CycleTracker";
import QiblaPage from "./pages/QiblaPage";
import LearnIslamPage from "./pages/LearnIslamPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { useRecentPage } from "./hooks/useRecentPage";

const queryClient = new QueryClient();

const AppContent = () => {
  useRecentPage();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Routes>
          {/* Public auth route */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected app routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/namaz" element={<ProtectedRoute><Index /></ProtectedRoute>} />

          <Route path="/dua" element={<ProtectedRoute><DuaPage /></ProtectedRoute>} />
          <Route path="/dua/daily" element={<ProtectedRoute><DailyDuas /></ProtectedRoute>} />
          <Route path="/dua/additional" element={<ProtectedRoute><AdditionalDuas /></ProtectedRoute>} />
          <Route path="/dua/tasbeeh" element={<ProtectedRoute><TasbeehPage /></ProtectedRoute>} />

          <Route path="/tasbeeh" element={<ProtectedRoute><TasbeehPage /></ProtectedRoute>} />

          <Route path="/quran" element={<ProtectedRoute><QuranPage /></ProtectedRoute>} />
          <Route path="/quran/:juzNumber" element={<ProtectedRoute><QuranReader /></ProtectedRoute>} />

          <Route path="/qibla" element={<ProtectedRoute><QiblaPage /></ProtectedRoute>} />

          <Route path="/learn" element={<ProtectedRoute><LearnIslamPage /></ProtectedRoute>} />

          <Route path="/cycle" element={<ProtectedRoute><CycleTracker /></ProtectedRoute>} />
          <Route path="/care" element={<ProtectedRoute><CycleTracker /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
