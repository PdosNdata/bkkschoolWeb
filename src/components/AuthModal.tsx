import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, Apple, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const AuthModal = ({
  isOpen,
  onClose
}: AuthModalProps) => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: 'ยินดีต้อนรับเข้าสู่ระบบ'
        });
        onClose();
        navigate('/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "รหัสผ่านไม่ตรงกัน",
            description: "กรุณาตรวจสอบรหัสผ่านอีกครั้ง",
            variant: "destructive"
          });
          return;
        }
        const redirectUrl = `${window.location.origin}/`;
        const {
          error
        } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        toast({
          title: "สมัครสมาชิกสำเร็จ!",
          description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี"
        });
        onClose();
      }
    } catch (error: any) {
      if (isLogin) {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: error.message || 'กรุณาลองใหม่อีกครั้ง'
        });
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: error.message || 'กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบผ่าน Google ไม่สำเร็จ',
        text: error.message || 'ไม่สามารถเข้าสู่ระบบผ่าน Google ได้'
      });
      setIsLoading(false);
    }
  };
  const handleFacebookAuth = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบผ่าน Facebook ไม่สำเร็จ',
        text: error.message || 'ไม่สามารถเข้าสู่ระบบผ่าน Facebook ได้'
      });
      setIsLoading(false);
    }
  };
  const handleAppleAuth = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบผ่าน Apple ไม่สำเร็จ',
        text: error.message || 'ไม่สามารถเข้าสู่ระบบผ่าน Apple ได้'
      });
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: ""
    });
  };
  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Decorative header with wave */}
        <div className="relative">
          <div className="h-28 bg-gradient-to-b from-primary to-primary/70" />
          <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,64L48,69.3C96,75,192,85,288,106.7C384,128,480,160,576,149.3C672,139,768,85,864,69.3C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="hsl(var(--background))" />
          </svg>
        </div>

        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-primary text-left">Login</DialogTitle>
          <DialogDescription className="text-left">
            {isLogin ? "เข้าสู่ระบบเพื่อจัดการข้อมูลโรงเรียน" : "สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ"}
          </DialogDescription>
        </DialogHeader>

        <main className="px-6 pb-6 space-y-5">
          {/* Social buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button type="button" variant="outline" size="icon" className="rounded-xl shadow-sm" onClick={handleGoogleAuth} disabled={isLoading} aria-label="Sign in with Google">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </Button>
            <Button type="button" variant="outline" size="icon" className="rounded-xl shadow-sm" onClick={handleFacebookAuth} disabled={isLoading} aria-label="Sign in with Facebook">
              <Facebook className="h-5 w-5" />
            </Button>
            
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} className="pl-10 rounded-xl" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={e => handleInputChange("password", e.target.value)} className="pl-10 pr-10 rounded-xl" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input id="confirmPassword" type="password" placeholder="ยืนยันรหัสผ่าน" value={formData.confirmPassword} onChange={e => handleInputChange("confirmPassword", e.target.value)} className="pl-10 rounded-xl" required />
                </div>
              </div>}

            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary hover:underline">Forgot Password?</button>
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
              {isLoading ? "กำลังดำเนินการ..." : isLogin ? "Login" : "Register"}
            </Button>
          </form>

          <div className="text-center">
            <button type="button" onClick={toggleMode} className="text-sm text-primary hover:underline">
              {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
            </button>
          </div>
        </main>
      </DialogContent>
    </Dialog>;
};
export default AuthModal;