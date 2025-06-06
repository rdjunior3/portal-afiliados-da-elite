import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

  // 👑 TODOS OS USUÁRIOS AUTENTICADOS TÊM ACESSO
  // O perfil pode ser completado pela página de configurações quando necessário
  console.log('✅ [ProfileGuard] Acesso liberado para usuário autenticado');
  return <>{children}</>;
};

export default ProfileGuard; 