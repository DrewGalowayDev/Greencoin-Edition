import ProjectsIndex from "./pages/Projects/Index";
import ProjectsNew from "./pages/Projects/New";
import ProjectsVerify from "./pages/Projects/Verify";
import Land from "./pages/Land";
import CropsRotation from "./pages/CropsRotation";
import Practices from "./pages/Practices";
import Credits from "./pages/Credits";
import CreditsForecast from "./pages/CreditsForecast";
import CreditsRetired from "./pages/CreditsRetired";
import MarketSell from "./pages/MarketSell";
import MarketAuctions from "./pages/MarketAuctions";
import MarketPrices from "./pages/MarketPrices";
import TechIot from "./pages/TechIot";
import TechResources from "./pages/TechResources";
import TechNetwork from "./pages/TechNetwork";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={<ProtectedRoute><ProjectsIndex /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><ProjectsNew /></ProtectedRoute>} />
            <Route path="/projects/verify" element={<ProtectedRoute><ProjectsVerify /></ProtectedRoute>} />
            <Route path="/land" element={<ProtectedRoute><Land /></ProtectedRoute>} />
            <Route path="/crops/rotation" element={<ProtectedRoute><CropsRotation /></ProtectedRoute>} />
            <Route path="/practices" element={<ProtectedRoute><Practices /></ProtectedRoute>} />
            <Route path="/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
            <Route path="/credits/forecast" element={<ProtectedRoute><CreditsForecast /></ProtectedRoute>} />
            <Route path="/credits/retired" element={<ProtectedRoute><CreditsRetired /></ProtectedRoute>} />
            <Route path="/market/sell" element={<ProtectedRoute><MarketSell /></ProtectedRoute>} />
            <Route path="/market/auctions" element={<ProtectedRoute><MarketAuctions /></ProtectedRoute>} />
            <Route path="/market/prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
            <Route path="/tech/iot" element={<ProtectedRoute><TechIot /></ProtectedRoute>} />
            <Route path="/tech/resources" element={<ProtectedRoute><TechResources /></ProtectedRoute>} />
            <Route path="/tech/network" element={<ProtectedRoute><TechNetwork /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
