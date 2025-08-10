import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import Swal from "sweetalert2";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettingsModal = ({ isOpen, onClose }: UserSettingsModalProps) => {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      setDisplayName(data?.display_name ?? "");
      setAvatarUrl(data?.avatar_url ?? null);
    };

    loadProfile();
  }, [isOpen]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ยังไม่ได้เข้าสู่ระบบ');

      let uploadedUrl: string | null = avatarUrl;
      if (file) {
        const path = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
        uploadedUrl = publicData.publicUrl;
      }

      const payload = { id: user.id, display_name: displayName, avatar_url: uploadedUrl };
      const { error: upsertError } = await supabase.from('profiles').upsert(payload);
      if (upsertError) throw upsertError;

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });
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
