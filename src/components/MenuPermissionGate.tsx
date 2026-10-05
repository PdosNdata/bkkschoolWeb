import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Renders its children only for admins or for accounts an admin granted the
 * given menu permission (หน้า Admin → จัดการสิทธิ์เมนู). Everyone else is sent
 * back to the dashboard. The matching database rule is enforced separately
 * (RLS) so this is not the only protection.
 */
const MenuPermissionGate = ({ permission, children }: { permission: string; children: ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let ok = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (uid) {
          const [{ data: roles }, { data: perms }] = await Promise.all([
            supabase.from("user_roles").select("role").eq("user_id", uid).eq("approved", true),
            supabase.from("user_permissions").select("permission_name").eq("user_id", uid).eq("permission_name", permission).eq("granted", true),
          ]);
          ok = (roles ?? []).some((r) => r.role === "admin") || (perms ?? []).length > 0;
        }
      } catch {
        ok = false;
      }
      if (cancelled) return;
      if (!ok) {
        toast({ title: "ไม่มีสิทธิ์เข้าใช้งานเมนูนี้", description: "ติดต่อแอดมินเพื่อขออนุมัติสิทธิ์", variant: "destructive" });
        navigate("/dashboard", { replace: true });
        return;
      }
      setAllowed(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }
  return <>{children}</>;
};

export default MenuPermissionGate;
