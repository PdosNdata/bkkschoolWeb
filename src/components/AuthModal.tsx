import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
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
  const [rememberMe, setRememberMe] = useState(false);
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
        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: 'ยินดีต้อนรับเข้าสู่ระบบ',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        });
        onClose();
        window.location.assign('/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "รหัสผ่านไม่ตรงกัน",
            description: "กรุณาตรวจสอบรหัสผ่านอีกครั้ง",
            variant: "destructive"
          });
          return;
        }
        const redirectUrl = `https://www.bankhodonkhan.ac.th/`;
        const {
          error
        } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            await Swal.fire({
              icon: 'error',
              title: 'อีเมลนี้ถูกใช้งานแล้ว',
              text: 'กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ',
              showConfirmButton: false,
              timer: 15000,
              timerProgressBar: true
            });
            return;
          }
          
          if (error.message.includes('Password') || error.message.includes('password')) {
            await Swal.fire({
              icon: 'error',
              title: 'รหัสผ่านไม่ตรงตามข้อกำหนด',
              text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
              showConfirmButton: false,
              timer: 15000,
              timerProgressBar: true
            });
            return;
          }
          
          throw error;
        }
        
        toast({
          title: "สมัครสมาชิกสำเร็จ!",
          description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี"
        });
        onClose();
      }
    } catch (error: any) {
      if (isLogin) {
        await Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: error.message || 'กรุณาลองใหม่อีกครั้ง',
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true
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
      const redirectUrl = `https://www.bankhodonkhan.ac.th/`;
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
      const redirectUrl = `https://www.bankhodonkhan.ac.th/`;
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
      const redirectUrl = `https://www.bankhodonkhan.ac.th/`;
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl m-4 p-8 shadow-2xl">
          {/* User Avatar Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>

          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? "ยินดีต้อนรับ" : "สร้างบัญชีใหม่"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isLogin ? "กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานต่อ" : "สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">ชื่อผู้ใช้</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="กรอกชื่อผู้ใช้" 
                  value={formData.email} 
                  onChange={e => handleInputChange("email", e.target.value)} 
                  className="pl-10 h-12 border-gray-200 rounded-lg focus:border-purple-500" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">รหัสผ่าน</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="กรอกรหัสผ่าน" 
                  value={formData.password} 
                  onChange={e => handleInputChange("password", e.target.value)} 
                  className="pl-10 pr-10 h-12 border-gray-200 rounded-lg focus:border-purple-500" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">ยืนยันรหัสผ่าน</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="ยืนยันรหัสผ่าน" 
                    value={formData.confirmPassword} 
                    onChange={e => handleInputChange("confirmPassword", e.target.value)} 
                    className="pl-10 h-12 border-gray-200 rounded-lg focus:border-purple-500" 
                    required 
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">จดจำฉัน</Label>
                </div>
                <button type="button" className="text-sm text-purple-600 hover:underline">
                  ลืมรหัสผ่าน?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? "กำลังดำเนินการ..." : isLogin ? "เข้าระบบ" : "สมัครสมาชิก"}
            </Button>
          </form>

          {isLogin && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">หรือ</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-3" 
                onClick={handleGoogleAuth} 
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-gray-700">เข้าสู่ระบบด้วย Google</span>
              </Button>
            </>
          )}

          <div className="text-center mt-6">
            <button 
              type="button" 
              onClick={toggleMode} 
              className="text-sm text-purple-600 hover:underline"
            >
              {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default AuthModal;