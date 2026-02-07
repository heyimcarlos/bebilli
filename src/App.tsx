import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useOAuthCallback } from "./hooks/useOAuthCallback";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import AdminPartnersPage from "./pages/AdminPartnersPage";
import AdminGroupsPage from "./pages/AdminGroupsPage";
import AdminCouponsPage from "./pages/AdminCouponsPage";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Wrapper component to handle OAuth callback before rendering routes
const AppContent = () => {
  const { processing, processed } = useOAuthCallback();

  // Show loading while processing OAuth callback
  if (processing || !processed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/partners" element={<AdminPartnersPage onBack={() => window.history.back()} />} />
        <Route path="/admin/groups" element={<AdminGroupsPage onBack={() => window.history.back()} />} />
        <Route path="/admin/coupons" element={<AdminCouponsPage onBack={() => window.history.back()} />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
