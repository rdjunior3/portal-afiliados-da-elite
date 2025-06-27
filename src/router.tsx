import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ProtectedRoute } from './components/guards';
import DashboardLayout from './layouts/DashboardLayout';
import { Loading } from '@/components/ui/loading';
import App from './App';
import { QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Componente de Loading para Suspense
const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loading message="Carregando módulo..." size="lg" />
  </div>
);

// Pages principais (carregamento imediato)
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// 🔧 CORREÇÃO: Componente para callback OAuth com processamento real
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [processed, setProcessed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  useEffect(() => {
    // OAuth callback processing
    
    // Aguardar o AuthContext processar o callback
    const processCallback = async () => {
      if (processed) return;
      
      // Dar mais tempo para processamento se ainda está loading
      if (loading && attempts < 8) {
        // Processando callback OAuth...
        setAttempts(prev => prev + 1);
        return;
      }
      
      setProcessed(true);
      
      // Aguardar um tempo adicional para o Supabase processar o token
      if (attempts <= 3) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Verificar se o usuário foi autenticado
      if (user && !loading) {
        navigate('/dashboard', { replace: true });
      } else if (!loading && attempts >= 6) {
        navigate('/login', { replace: true });
      } else if (!loading) {
        setAttempts(prev => prev + 1);
        setProcessed(false);
      }
    };
    
    // Processar após um delay progressivo baseado nas tentativas
    const delay = Math.min(1000 + (attempts * 500), 3000); // 1s a 3s
    const timer = setTimeout(processCallback, delay);
    
    return () => clearTimeout(timer);
  }, [user, loading, navigate, processed, attempts]);
  
  // Se o usuário já está autenticado, redirecionar imediatamente
  useEffect(() => {
    if (user && !loading && !processed) {
      setProcessed(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, processed]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400 mx-auto"></div>
        <h2 className="text-white text-xl mt-4">Processando login com Google...</h2>
        <p className="text-slate-400 mt-2">
          {attempts > 0 ? `Tentativa ${attempts + 1}... Aguarde.` : 'Você será redirecionado em instantes.'}
        </p>
        {attempts > 4 && (
          <p className="text-yellow-400 mt-2 text-sm">
            ⏳ Processamento demorou mais que o esperado. Aguarde...
          </p>
        )}
      </div>
    </div>
  );
};

// Pages com lazy loading (componentes pesados)
const Products = lazy(() => import('./pages/dashboard/Products'));
const Reports = lazy(() => import('./pages/dashboard/Reports'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const Courses = lazy(() => import('./pages/content/Courses'));
const CourseDetail = lazy(() => import('./pages/content/CourseDetail'));
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));

// Admin Routes (lazy loading para páginas admin)
const ManageAffiliates = lazy(() => import('./pages/admin/ManageAffiliates'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts'));
const ManageContent = lazy(() => import('./pages/admin/ManageContent'));

export const createRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <Index />
        },
        {
          path: 'login',
          element: <Login />
        },
        {
          path: 'signup',
          element: <Signup />
        },
        {
          path: 'auth/callback',
          element: <OAuthCallback />
        },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Dashboard />
            },
            {
              path: 'products',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <Products />
                </Suspense>
              )
            },
            {
              path: 'reports',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <Reports />
                </Suspense>
              )
            },
            {
              path: 'notifications',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <Notifications />
                </Suspense>
              )
            },
            {
              path: 'settings',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <Settings />
                </Suspense>
              )
            },
            {
              path: 'content',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <Courses />
                </Suspense>
              )
            },
            {
              path: 'content/:courseId',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <CourseDetail />
                </Suspense>
              )
            },
            {
              path: 'chat',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <ChatPage />
                </Suspense>
              )
            },
          ],
        },
        {
          path: '/admin',
          element: (
            <ProtectedRoute requireAdmin={true}>
              <DashboardLayout />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Navigate to="/admin/affiliates" replace />
            },
            {
              path: 'affiliates',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <ManageAffiliates />
                </Suspense>
              )
            },
            {
              path: 'products',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <ManageProducts />
                </Suspense>
              )
            },
            {
              path: 'content',
              element: (
                <Suspense fallback={<LazyLoadingFallback />}>
                  <ManageContent />
                </Suspense>
              )
            }
          ]
        },
        {
          path: '*',
          element: <Navigate to="/" replace />
        }
      ]
    }
  ]); 