import { Toaster } from "@/components/ui/toaster";
import CursorSpotlight from "./components/CursorSpotlight";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initializeCapacitor, setupDeepLinks } from "./lib/capacitor";
import { NavigationProvider } from "./contexts/NavigationContext";
import { Header } from "./components/Header";
import { NavigationDrawer } from "./components/NavigationDrawer";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeCapacitor();
    setupDeepLinks();
  }, []);

  return (
    <>
      <CursorSpotlight />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NavigationProvider>
            <Toaster />
            <Sonner />
            <Header />
            <NavigationDrawer />
            <main className="pt-16">
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </main>
          </NavigationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
