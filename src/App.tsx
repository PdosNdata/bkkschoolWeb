import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Swal from "sweetalert2";
import Index from "./pages/Index";
import AdmissionForm from "./pages/AdmissionForm";
import Dashboard from "./pages/Dashboard";
import PublicRelations from "./pages/PublicRelations";
import NewsFormPage from "./pages/NewsFormPage";
import MediaFormPage from "./pages/MediaFormPage";
import ActivitiesFormPage from "./pages/ActivitiesFormPage";
import AllActivitiesPage from "./pages/AllActivitiesPage";
import ActivityAllFormPage from "./pages/ActivityAllFormPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import AdminPage from "./pages/AdminPage";
import PersonnelPage from "./pages/PersonnelPage";
import PersonnelFormPage from "./pages/PersonnelFormPage";
import PersonnelReportPage from "./pages/PersonnelReportPage";
import PublicPersonnelReport from "./pages/PublicPersonnelReport";
import PersonnelInSchool from "./pages/PersonnelInSchool";
import MenuPermissionsPage from "./pages/MenuPermissionsPage";
import TextbookDashboard from "./pages/TextbookDashboard";
import DocumentUploadPage from "./pages/DocumentUploadPage";
import DocumentsPublicPage from "./pages/DocumentsPublicPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        // Clean token fragment after Supabase sets the session
        if (window.location.hash && window.location.hash.includes("access_token")) {
          setTimeout(() => {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }, 0);
        }

        // Check if user has a role, if not create one (for Google OAuth users)
        if (session?.user) {
          setTimeout(async () => {
            const { data: existingRole } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (!existingRole) {
              // Create default role for Google OAuth users
              await supabase
                .from('user_roles')
                .insert({
                  user_id: session.user.id,
                  role: 'teacher',
                  email: session.user.email
                });
            }
          }, 0);
        }

        // Auto-enter the dashboard only for allowed users. Denial is handled
        // by ProtectedRoute on the dashboard itself (where the session token
        // is fully settled), so a transient "not allowed" here does nothing.
        if (!location.pathname.startsWith("/dashboard")) {
          const { data: canAccess } = await supabase.rpc("can_access_dashboard");
          if (canAccess === true) {
            navigate("/dashboard", { replace: true });
          }
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
          
          // Route based on whether the user may access the dashboard
          if (session) {
            supabase.rpc("can_access_dashboard").then(({ data: canAccess }) => {
              if (canAccess === true) {
                if (!location.pathname.startsWith("/dashboard")) {
                  navigate("/dashboard", { replace: true });
                }
              } else {
                navigate("/", { replace: true });
              }
            });
          }
        })
        .catch((err) => {
          console.error("OAuth code exchange failed", err);
        });
    }

    // A signed-in user visiting the home page stays on the home page — the
    // logo / school name is a real link back here. They reach the dashboard
    // via the login flow or the "แดชบอร์ด" item in the header menu.

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
    let mounted = true;
    let settled = false;

    const allow = () => {
      if (mounted && !settled) {
        settled = true;
        setChecking(false);
      }
    };

    const deny = async (message?: string) => {
      if (!mounted || settled) return;
      settled = true;
      if (message) {
        await Swal.fire({
          icon: "info",
          title: "ไม่มีสิทธิ์เข้าใช้งานระบบ",
          text: message,
          confirmButtonText: "รับทราบ",
        });
      }
      if (mounted) navigate("/", { replace: true });
    };

    // Verify there is a session AND that the user is allowed into the
    // dashboard. Anyone without permission is sent back to the home page
    // and the protected page never renders.
    const evaluate = async (attempt = 0) => {
      if (settled) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted || settled) return;

      if (!session) {
        const url = new URL(window.location.href);
        const hasCode = !!url.searchParams.get("code");
        const hash = window.location.hash || "";
        const hasAuthInHash = hash.includes("access_token") || hash.includes("refresh_token") || hash.includes("type=");

        if (!hasCode && !hasAuthInHash) {
          deny();
        } else {
          // OAuth flow still settling — try again shortly
          setTimeout(() => { if (mounted) evaluate(attempt); }, 800);
        }
        return;
      }

      const { data: canAccess, error } = await supabase.rpc("can_access_dashboard");
      if (!mounted || settled) return;

      if (error) {
        // The session token may not be attached yet on a cold load — retry
        // a few times before giving up.
        if (attempt < 3) {
          setTimeout(() => { if (mounted) evaluate(attempt + 1); }, 600);
        } else {
          deny();
        }
        return;
      }

      if (canAccess === true) {
        allow();
      } else {
        deny("บัญชีนี้ยังไม่ได้รับสิทธิ์เข้าใช้งานส่วนจัดการ กรุณาติดต่อผู้ดูแลระบบ");
      }
    };

    evaluate();

    // Re-evaluate whenever auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted || settled) return;
      if (session) {
        evaluate();
      } else {
        deny();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }
  
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
              <Route 
                path="/activity-all-form" 
                element={
                  <ProtectedRoute>
                    <ActivityAllFormPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/activities/:id" element={<ActivityDetailPage />} />
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
              <Route path="/public-personnel-report" element={<PublicPersonnelReport />} />
              <Route 
                path="/menu-permissions"
                element={
                  <ProtectedRoute>
                    <MenuPermissionsPage />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/textbook-dashboard"
                element={
                  <ProtectedRoute>
                    <TextbookDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/document-upload"
                element={
                  <ProtectedRoute>
                    <DocumentUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/documents" element={<DocumentsPublicPage />} />
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

