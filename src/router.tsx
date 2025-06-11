import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/dashboard/Products';
import Reports from './pages/dashboard/Reports';
import Notifications from './pages/dashboard/Notifications';
import Settings from './pages/dashboard/Settings';
import Courses from './pages/content/Courses';
import CourseDetail from './pages/content/CourseDetail';
import ChatPage from './pages/chat/ChatPage';
import App from './App';
import { QueryClient } from '@tanstack/react-query';

// Admin Routes
import ManageAffiliates from './pages/admin/ManageAffiliates';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCommissions from './pages/admin/ManageCommissions';
import ManageContent from './pages/admin/ManageContent';

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
              element: <Products />
            },
            {
              path: 'reports',
              element: <Reports />
            },
            {
              path: 'notifications',
              element: <Notifications />
            },
            {
              path: 'settings',
              element: <Settings />
            },
            {
              path: 'content',
              element: <Courses />
            },
            {
              path: 'content/:courseId',
              element: <CourseDetail />
            },
            {
              path: 'chat',
              element: <ChatPage />
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
              element: <ManageAffiliates />
            },
            {
              path: 'products',
              element: <ManageProducts />
            },
            {
              path: 'commissions',
              element: <ManageCommissions />
            },
            {
              path: 'content',
              element: <ManageContent />
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