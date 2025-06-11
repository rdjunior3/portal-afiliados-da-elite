import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { Loading } from '@/components/ui/loading';
import App from './App';
import { QueryClient } from '@tanstack/react-query';

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