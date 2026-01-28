import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState({
  //   id: 1,
  //   name: 'ผู้ดูแลระบบ',
  //   role: 'admin'
  // });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      // บันทึก token และ user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                        'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบ username และ password';
      return { success: false, message: errorMessage };
    }
  };

  const register = async (email, password, fullName, role = 'teacher') => {
    try {
      // สมัครสมาชิกผ่าน Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // บันทึกข้อมูลเพิ่มเติมลงตาราง users (ถ้ามี)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role,
          });

        // ถ้าตาราง users ไม่มีก็ไม่เป็นไร
        if (profileError) {
          console.log('Profile insert skipped:', profileError.message);
        }
      }

      return {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
        user: authData.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่';

      if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
      } else if (error.message?.includes('invalid email') || error.message?.includes('Invalid email')) {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.message?.includes('password') || error.message?.includes('Password')) {
        errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      } else if (error.message?.includes('Email signups are disabled')) {
        errorMessage = 'ระบบยังไม่เปิดให้สมัครสมาชิกด้วยอีเมล กรุณาติดต่อผู้ดูแลระบบ';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};