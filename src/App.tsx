import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import { usePageTracking, usePerformanceMonitoring } from './hooks/useAnalytics';
import { validateEnv } from './config/env';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Dashboard Pages
import Products from './pages/dashboard/Products';
import Links from './pages/dashboard/Links';
import Analytics from './pages/dashboard/Analytics';
import Commissions from './pages/dashboard/Commissions';
import Payments from './pages/dashboard/Payments';
import Reports from './pages/dashboard/Reports';
import Profile from './pages/dashboard/Profile';
import Notifications from './pages/dashboard/Notifications';
import Settings from './pages/dashboard/Settings';

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
      
      {/* Dashboard Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="links" element={<Links />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
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
