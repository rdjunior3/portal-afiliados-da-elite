import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Se ainda está carregando, mostra tela de loading
  if (loading) {
    return <LoadingScreen message="Verificando seu perfil..." />;
  }

  // Se não tem usuário, não deveria estar aqui (ProtectedRoute deveria ter lidado com isso)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se está na página de completar perfil, deixa passar
  if (location.pathname === '/complete-profile') {
    return <>{children}</>;
  }

  // Verificar se o perfil está incompleto
  const isProfileIncomplete = !profile?.first_name || 
                              !profile?.last_name || 
                              !profile?.phone || 
                              profile?.affiliate_status === 'pending' ||
                              !profile?.onboarding_completed_at;

  // Se o perfil está incompleto, redireciona para completar
  if (isProfileIncomplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Se o perfil está completo, renderiza o conteúdo
  return <>{children}</>;
};

export default ProfileGuard; 