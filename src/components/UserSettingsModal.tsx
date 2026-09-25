import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import Swal from "sweetalert2";
import { withTimeout } from "@/lib/utils";

const MAX_AVATAR_MB = 8;

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettingsModal = ({ isOpen, onClose }: UserSettingsModalProps) => {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student" | "guardian" | "">("");
  // Role as loaded, and whether this account is an admin — used so saving the
  // dialog never rewrites an admin's role and only touches the role if changed.
  const [originalRole, setOriginalRole] = useState<string>("");
  const [isAdminUser, setIsAdminUser] = useState(false);
  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      try {
        const { data: { user } } = await withTimeout(supabase.auth.getUser(), 15000, "ตรวจสอบผู้ใช้");
        if (!user) return;
        const { data } = await withTimeout(
          supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle(),
          15000,
          "โหลดข้อมูลโปรไฟล์",
        );

        setDisplayName(data?.display_name ?? "");
        setAvatarUrl(data?.avatar_url ?? null);

        const { data: roleRows } = await withTimeout(
          (supabase as any).from('user_roles').select('role').eq('user_id', user.id) as Promise<{ data: { role: string }[] | null }>,
          15000,
          "โหลดสถานะผู้ใช้",
        );
        const roles = (roleRows ?? []).map((r) => r.role);
        setIsAdminUser(roles.includes('admin'));
        const shown = roles.find((r) => r !== 'admin') ?? roles[0] ?? "";
        setRole(shown as typeof role);
        setOriginalRole(shown);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [isOpen]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_AVATAR_MB * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'ไฟล์รูปใหญ่เกินไป',
        text: `เลือกรูปไม่เกิน ${MAX_AVATAR_MB}MB (ไฟล์นี้ ${(f.size / 1024 / 1024).toFixed(1)}MB) ลองย่อขนาดรูปก่อน`,
      });
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await withTimeout(supabase.auth.getUser(), 15000, "ตรวจสอบผู้ใช้");
      if (!user) throw new Error('ยังไม่ได้เข้าสู่ระบบ');

      if (newPassword.trim().length > 0 && newPassword !== confirmPassword) {
        throw new Error('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      }

      let uploadedUrl: string | null = avatarUrl;
      if (file) {
        // Safe storage key: keep only the extension (Thai/long names not needed)
        const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await withTimeout(
          supabase.storage.from('avatars').upload(path, file, { upsert: true }),
          60000,
          "อัพโหลดรูปโปรไฟล์",
        );
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
        uploadedUrl = publicData.publicUrl;
      }

      const { error: updateError } = await withTimeout(
        supabase
          .from('profiles')
          .update({ display_name: displayName, avatar_url: uploadedUrl })
          .eq('id', user.id),
        20000,
        "บันทึกโปรไฟล์",
      );
      if (updateError) throw updateError;

      // Only touch the role if the user actually changed it, and never for
      // admins (an admin picking "ครู" here would otherwise demote themselves).
      if (role && role !== originalRole && !isAdminUser) {
        const { error: roleUpdateError } = await withTimeout(
          (supabase as any).from('user_roles').update({ role }).eq('user_id', user.id) as Promise<{ error: Error | null }>,
          20000,
          "บันทึกสถานะผู้ใช้",
        );
        if (roleUpdateError) throw roleUpdateError;
        setOriginalRole(role);
      }

      // Update password if provided
      if (newPassword.trim().length > 0) {
        const { error: pwdError } = await withTimeout(
          supabase.auth.updateUser({ password: newPassword }),
          20000,
          "เปลี่ยนรหัสผ่าน",
        );
        if (pwdError) throw pwdError;
      }

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });
      // Reset sensitive fields
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error.message || 'กรุณาลองใหม่อีกครั้ง',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">ตั้งค่าผู้ใช้</DialogTitle>
          <DialogDescription>แก้ไขชื่อผู้ใช้และรูปโปรไฟล์ของคุณ</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={file ? URL.createObjectURL(file) : (avatarUrl ?? undefined)} alt="รูปโปรไฟล์ผู้ใช้" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar">เปลี่ยนรูปโปรไฟล์</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={onFileChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">ชื่อที่แสดง</Label>
            <Input
              id="displayName"
              placeholder="กรอกชื่อของคุณ"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userStatus">สถานะผู้ใช้</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "teacher" | "student" | "guardian")} disabled={isAdminUser}>
              <SelectTrigger id="userStatus">
                <SelectValue placeholder="เลือกสถานะ (ครู/นักเรียน/ผู้ปกครอง)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">ครู</SelectItem>
                <SelectItem value="student">นักเรียน</SelectItem>
                <SelectItem value="guardian">ผู้ปกครอง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password change */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsModal;
