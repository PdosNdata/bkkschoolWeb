import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - เพิ่ม JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - จัดการ error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ลบ token และ user จาก localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect ไป login page
      window.location.href = '/login';
    }
    
    // แปลง error message เป็นภาษาไทย
    const errorMessage = error.response?.data?.message || 
                      error.message || 
                      'เกิดข้อผิดพลาด กรุณาลองใหม่';
    
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default api;