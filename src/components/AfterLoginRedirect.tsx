import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasAfterLogin, takeAfterLogin } from "@/lib/afterLogin";

/** เมื่อล็อกอินแล้วและมีหน้าที่จำไว้ (ดู lib/afterLogin) → ไปหน้านั้นแทนแดชบอร์ด */
const AfterLoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const go = () => {
      if (!hasAfterLogin()) return;
      const path = takeAfterLogin();
      if (path && path !== window.location.pathname + window.location.search) navigate(path, { replace: true });
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) go();
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) go();
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

export default AfterLoginRedirect;
