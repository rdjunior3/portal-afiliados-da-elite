import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [showEscapeButton, setShowEscapeButton] = useState(false);
  
  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    if (loading) {
      // Timeout principal - após 8 segundos, força redirecionamento
      const mainTimeout = setTimeout(() => {
        console.warn('ProtectedRoute: Timeout de verificação de autenticação atingido');
        setTimeoutReached(true);
        
        // Se não há usuário após timeout, redireciona para LOGIN, não home
        if (!user) {
          console.log('ProtectedRoute: Redirecionando usuário não autenticado para login');
          navigate('/login', { 
            replace: true,
            state: { 
              from: location.pathname,
              reason: 'session_timeout' 
            }
          });
        }
      }, 8000);

      // Mostra botão de escape após 5 segundos
      const escapeTimeout = setTimeout(() => {
        setShowEscapeButton(true);
      }, 5000);

      return () => {
        clearTimeout(mainTimeout);
        clearTimeout(escapeTimeout);
      };
    } else {
      setTimeoutReached(false);
      setShowEscapeButton(false);
    }
  }, [loading, user, navigate, location.pathname]);

  const handleEscapeToLogin = () => {
    console.log('ProtectedRoute: Usuário escapou para login');
    navigate('/login', { 
      replace: true,
      state: { 
        from: location.pathname,
        reason: 'user_requested' 
      }
    });
  };

  // Se timeout foi atingido e não há usuário, redireciona para LOGIN
  if (timeoutReached && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  
  if (loading) {
    return <LoadingScreen 
      message="Verificando autenticação..." 
      showTimeout={true}
      onEscape={handleEscapeToLogin}
    />;
  }
  
  // Se não tem usuário, redireciona para LOGIN (não home)
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 