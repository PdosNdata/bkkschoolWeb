import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import AuthCallbackPage from './pages/public/AuthCallbackPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import StudentsPage from './pages/dashboard/StudentsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import BudgetPage from './pages/admin/BudgetPage'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Route>
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/budget"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BudgetPage />
          </ProtectedRoute>
        }
      />
      {/* Dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
