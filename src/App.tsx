import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import AdmissionForm from "./pages/AdmissionForm";
import Dashboard from "./pages/Dashboard";
import PublicRelations from "./pages/PublicRelations";
import NewsFormPage from "./pages/NewsFormPage";
import MediaFormPage from "./pages/MediaFormPage";
import ActivitiesFormPage from "./pages/ActivitiesFormPage";
import AllActivitiesPage from "./pages/AllActivitiesPage";
import AdminPage from "./pages/AdminPage";
import PersonnelPage from "./pages/PersonnelPage";
import PersonnelFormPage from "./pages/PersonnelFormPage";
import PersonnelReportPage from "./pages/PersonnelReportPage";
import PersonnelInSchool from "./pages/PersonnelInSchool";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // Clean token fragment after Supabase sets the session
        if (window.location.hash && window.location.hash.includes("access_token")) {
          setTimeout(() => {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }, 0);
        }

        // Check session and redirect to dashboard if not already there
        if (!location.pathname.startsWith("/dashboard")) {
          navigate("/dashboard", { replace: true });
        }
      }

      if (event === "SIGNED_OUT") {
        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      }
    });

    // Exchange OAuth code for session (PKCE) if present
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.get("code");
    const hasError = url.searchParams.get("error");
    if (hasCode && !hasError) {
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(({ data: { session } }) => {
          // Clean query params after successful exchange
          window.history.replaceState(null, "", window.location.pathname);
          
          // If session exists after code exchange, redirect to dashboard
          if (session && !location.pathname.startsWith("/dashboard")) {
            navigate("/dashboard", { replace: true });
          }
        })
        .catch((err) => {
          console.error("OAuth code exchange failed", err);
        });
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth changes to avoid redirecting away while tokens are being processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setChecking(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setChecking(false);
      } else {
        const url = new URL(window.location.href);
        const hasCode = !!url.searchParams.get("code");
        const hash = window.location.hash || "";
        const hasAuthInHash = hash.includes("access_token") || hash.includes("refresh_token") || hash.includes("type=");
        // If there is no ongoing auth flow, send user home
        if (!hasCode && !hasAuthInHash) {
          navigate("/", { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (checking) return null;
  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SpeedInsights />
        <BrowserRouter>
          <AuthProvider>
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
              <Route 
                path="/NewsForm" 
                element={
                  <ProtectedRoute>
                    <NewsFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/activities-form" 
                element={
                  <ProtectedRoute>
                    <ActivitiesFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/activities" element={<AllActivitiesPage />} />
              <Route path="/personinschool" element={<PersonnelInSchool />} />
              <Route 
                path="/media-form" 
                element={
                  <ProtectedRoute>
                    <MediaFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/personnel" 
                element={
                  <ProtectedRoute>
                    <PersonnelPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/personnel-form" 
                element={
                  <ProtectedRoute>
                    <PersonnelFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/personnel-report" 
                element={
                  <ProtectedRoute>
                    <PersonnelReportPage />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

