import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileGuard from './components/ProfileGuard';
import ChatGuard from './components/ChatGuard';

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
import App from './App';
import { QueryClient } from '@tanstack/react-query';

export const createRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <Index />,
        },
        {
          path: 'login',
          element: <Login />,
        },
        {
          path: 'signup',
          element: <Signup />,
        },
        {
          path: 'forgot-password',
          element: <ForgotPassword />,
        },
        {
          path: 'reset-password',
          element: <ResetPassword />,
        },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute>
              <ProfileGuard>
                <DashboardLayout />
              </ProfileGuard>
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
            {
              path: 'products',
              element: <Products />,
            },
            {
              path: 'content',
              element: <Courses />,
            },
            {
              path: 'content/:courseId',
              element: <CourseDetail />,
            },
            {
              path: 'chat',
              element: (
                <ChatGuard>
                  <ChatPage />
                </ChatGuard>
              ),
            },
            {
              path: 'reports',
              element: <Reports />,
            },
            {
              path: 'notifications',
              element: <Notifications />,
            },
            {
              path: 'settings',
              element: <Settings />,
            },
          ],
        },
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ]); 