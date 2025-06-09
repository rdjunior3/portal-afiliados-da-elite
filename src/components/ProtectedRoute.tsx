import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  // Se não tem usuário, redireciona para login
  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 