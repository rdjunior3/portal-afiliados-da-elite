import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireModerator = false 
}) => {
  const { user, session, loading, profile, isAdmin, isModerator } = useAuth();
  const location = useLocation();
  
  // Debug logs para troubleshooting
  console.log('🔐 [ProtectedRoute] Estado atual:', {
    hasUser: !!user,
    hasSession: !!session,
    hasProfile: !!profile,
    isLoading: loading,
    userRole: profile?.role,
    isVerified: profile?.is_verified,
    emailConfirmed: user?.email_confirmed_at,
    requireAdmin,
    requireModerator
  });
  
  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificar se há sessão válida E usuário autenticado
  if (!session || !user) {
    console.log('🚫 [ProtectedRoute] Acesso negado: sem sessão ou usuário');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Verificar se o perfil foi carregado (necessário para verificações de role)
  if (!profile && (requireAdmin || requireModerator)) {
    console.log('⏳ [ProtectedRoute] Aguardando carregamento do perfil...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Verificar permissões específicas
  if (requireAdmin && !isAdmin()) {
    console.log('🚫 [ProtectedRoute] Acesso negado: requer admin, role atual:', profile?.role);
    return <Navigate to="/dashboard" replace />;
  }

  if (requireModerator && !isModerator() && !isAdmin()) {
    console.log('🚫 [ProtectedRoute] Acesso negado: requer moderador');
    return <Navigate to="/dashboard" replace />;
  }

  // CORREÇÃO: Verificar confirmação de email apenas para usuários não-admin
  // Admins podem acessar mesmo sem confirmação de email
  if (!isAdmin() && user.email_confirmed_at === null) {
    console.log('📧 [ProtectedRoute] Email não confirmado para usuário não-admin');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Confirme seu email</h2>
          <p className="text-slate-300 mb-4">
            Verifique sua caixa de entrada e clique no link de confirmação para acessar a plataforma.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ [ProtectedRoute] Acesso autorizado para:', profile?.email || user?.email);
  return <>{children}</>;
};

export default ProtectedRoute; 