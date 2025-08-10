import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import AdmissionForm from "./pages/AdmissionForm";
import Dashboard from "./pages/Dashboard";
import PublicRelations from "./pages/PublicRelations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.assign("/");
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) return null;
  return children;
};

const App = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Clean token fragment after Supabase sets the session
        if (window.location.hash && window.location.hash.includes("access_token")) {
          setTimeout(() => {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }, 0);
        }

        if (!window.location.pathname.startsWith("/dashboard")) {
          window.location.assign("/dashboard");
        }
      }

      if (event === "SIGNED_OUT") {
        if (window.location.pathname !== "/") {
          window.location.assign("/");
        }
      }
    });

    // Exchange OAuth code for session (PKCE) if present
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.get("code");
    const hasError = url.searchParams.get("error");
    if (hasCode && !hasError) {
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(() => {
          // Clean query params after successful exchange
          window.history.replaceState(null, "", window.location.pathname);
        })
        .catch((err) => {
          console.error("OAuth code exchange failed", err);
        });
    }


    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admission" element={<AdmissionForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/public-relations" element={<PublicRelations />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

