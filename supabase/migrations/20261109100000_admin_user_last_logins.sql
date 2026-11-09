-- เวลาล็อกอินล่าสุดของผู้ใช้ สำหรับตารางสิทธิ์เมนูในหน้า Admin
-- ตาราง auth.users อ่านจากหน้าเว็บโดยตรงไม่ได้ จึงเปิดผ่านฟังก์ชันนี้ และให้เฉพาะแอดมินเท่านั้น
-- ส่งคืนแค่ user_id กับเวลา ไม่ส่งข้อมูลอื่นของบัญชี

CREATE OR REPLACE FUNCTION public.admin_user_last_logins()
RETURNS TABLE (user_id uuid, last_sign_in_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT au.id, au.last_sign_in_at FROM auth.users au;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_user_last_logins() FROM public;
REVOKE ALL ON FUNCTION public.admin_user_last_logins() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_user_last_logins() TO authenticated;

NOTIFY pgrst, 'reload schema';

-- ผลตรวจ: ควรได้ 1 แถว
SELECT proname AS "ฟังก์ชัน", prosecdef AS "security definer" FROM pg_proc WHERE proname = 'admin_user_last_logins';
