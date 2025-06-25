import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se está logado mas não é admin, mostra mensagem de acesso negado
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <Shield className="h-16 w-16 text-orange-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gradient-orange">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Esta área é exclusiva para administradores. Se você acredita que deveria ter acesso, entre em contato com o suporte.
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute; 