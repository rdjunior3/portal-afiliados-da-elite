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

  // 👑 ADMINS TÊM ACESSO TOTAL - INCLUINDO MODERATORS
  const isAdminUser = profile?.role === 'super_admin' || 
                      profile?.role === 'admin' || 
                      profile?.role === 'moderator';
  
  if (isAdminUser) {
    console.log('👑 [ProfileGuard] Admin/Moderator detectado - acesso total concedido');
    // Admins e moderadores têm acesso total, independente do perfil estar completo
    return <>{children}</>;
  }

  // Verificar se o perfil está incompleto (APENAS para afiliados regulares)
  const isProfileIncomplete = !profile?.first_name || 
                              !profile?.last_name || 
                              !profile?.phone || 
                              !profile?.onboarding_completed_at;

  // LÓGICA PARA AFILIADOS: Permitir acesso limitado ao dashboard mesmo com perfil incompleto
  // Só redireciona para complete-profile se explicitamente solicitado ou se é primeira vez
  const shouldRedirectToCompleteProfile = isProfileIncomplete && 
    (location.state?.forceCompleteProfile || 
     (!sessionStorage.getItem('profile_skip_allowed') && !profile?.first_name));

  if (shouldRedirectToCompleteProfile) {
    console.log('📝 [ProfileGuard] Redirecionando afiliado para completar perfil');
    return <Navigate to="/complete-profile" replace />;
  }

  // Se está tentando acessar recursos que requerem perfil completo e não tem (APENAS AFILIADOS)
  const requiresCompleteProfile = ['/dashboard/chat', '/dashboard/content', '/dashboard/reports'].includes(location.pathname);
  
  if (isProfileIncomplete && requiresCompleteProfile) {
    console.log('🔒 [ProfileGuard] Afiliado tentando acessar recurso premium sem perfil completo');
    // Em vez de redirecionar, renderiza uma mensagem de acesso limitado
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-slate-800/60 border-2 border-orange-500/30 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-slate-900 text-2xl">🔒</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Acesso Premium</h2>
            <p className="text-white mb-6">
              Complete seu perfil para acessar este recurso exclusivo da Elite e desbloquear todo o potencial da plataforma.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/complete-profile'}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20"
              >
                🚀 Completar Perfil Agora
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white hover:text-white font-medium py-3 px-6 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
              >
                ← Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se o perfil está completo ou está acessando áreas permitidas, renderiza o conteúdo
  console.log('✅ [ProfileGuard] Acesso liberado');
  return <>{children}</>;
};

export default ProfileGuard; 