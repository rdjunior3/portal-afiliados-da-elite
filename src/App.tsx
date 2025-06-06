import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileGuard from './components/ProfileGuard';
import ChatGuard from './components/ChatGuard';
import { usePageTracking, usePerformanceMonitoring } from './hooks/useAnalytics';
import { validateEnv } from './config/env';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';

// Dashboard Pages
import Products from './pages/dashboard/Products';
import Reports from './pages/dashboard/Reports';
import Notifications from './pages/dashboard/Notifications';
import Settings from './pages/dashboard/Settings';

// Content Pages
import Courses from './pages/content/Courses';
import CourseDetail from './pages/content/CourseDetail';

// Chat Pages
import ChatPage from './pages/chat/ChatPage';

// Validar variáveis de ambiente no carregamento (não crítico)
try {
  const isValid = validateEnv();
  if (!isValid) {
    console.warn('⚠️ App inicializado com configuração limitada');
  }
} catch (error) {
  console.error('❌ Erro de configuração (não crítico):', error);
}

function AppContent() {
  usePageTracking();
  usePerformanceMonitoring();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Dashboard Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProfileGuard>
              <DashboardLayout />
            </ProfileGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="content" element={<Courses />} />
        <Route path="content/:courseId" element={<CourseDetail />} />
        <Route path="chat" element={
          <ChatGuard>
            <ChatPage />
          </ChatGuard>
        } />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch-all route - redireciona qualquer rota não encontrada para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryProvider>
      <Router>
        <AuthProvider>
          <div className="App">
            <AppContent />
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryProvider>
  );
}

export default App;
