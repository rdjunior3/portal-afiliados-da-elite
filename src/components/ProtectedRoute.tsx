import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [showEscapeButton, setShowEscapeButton] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    if (loading) {
      // Timeout principal - após 6 segundos, força redirecionamento
      const mainTimeout = setTimeout(() => {
        console.warn('ProtectedRoute: Timeout de verificação de autenticação atingido');
        setTimeoutReached(true);
        
        // Se não há usuário E não há sessão após timeout, redireciona para LOGIN
        if (!user && !session) {
          console.log('ProtectedRoute: Redirecionando usuário não autenticado para login');
          navigate('/login', { 
            replace: true,
            state: { 
              from: location.pathname,
              reason: 'session_timeout' 
            }
          });
        }
      }, 6000);

      // Mostra botão de escape após 4 segundos
      const escapeTimeout = setTimeout(() => {
        setShowEscapeButton(true);
      }, 4000);

      return () => {
        clearTimeout(mainTimeout);
        clearTimeout(escapeTimeout);
      };
    } else {
      setTimeoutReached(false);
      setShowEscapeButton(false);
      setAuthChecked(true);
    }
  }, [loading, user, session, navigate, location.pathname]);

  // Verificação adicional para validar sessão
  useEffect(() => {
    if (!loading && authChecked) {
      // Se auth foi checado e não há usuário nem sessão, redireciona
      if (!user && !session) {
        console.log('ProtectedRoute: Usuário não autenticado detectado após verificação');
        navigate('/login', { 
          replace: true,
          state: { 
            from: location.pathname,
            reason: 'not_authenticated' 
          }
        });
        return;
      }

      // Se há sessão mas não há usuário, algo está inconsistente
      if (session && !user) {
        console.warn('ProtectedRoute: Sessão encontrada mas usuário não carregado');
        // Dar uma chance para o usuário carregar
        setTimeout(() => {
          if (!user) {
            console.log('ProtectedRoute: Usuário não carregou - redirecionando');
            navigate('/login', { 
              replace: true,
              state: { 
                from: location.pathname,
                reason: 'user_not_loaded' 
              }
            });
          }
        }, 2000);
      }
    }
  }, [loading, authChecked, user, session, navigate, location.pathname]);

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

  // Se timeout foi atingido e não há usuário nem sessão, redireciona para LOGIN
  if (timeoutReached && !user && !session) {
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