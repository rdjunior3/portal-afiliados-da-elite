import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [showEscapeButton, setShowEscapeButton] = useState(false);
  
  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    if (loading) {
      // Timeout principal - após 8 segundos, força redirecionamento
      const mainTimeout = setTimeout(() => {
        console.warn('ProtectedRoute: Timeout de verificação de autenticação atingido');
        setTimeoutReached(true);
        
        // Se não há usuário após timeout, redireciona para home
        if (!user) {
          navigate('/', { replace: true });
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
  }, [loading, user, navigate]);

  const handleEscapeToHome = () => {
    console.log('ProtectedRoute: Usuário escapou para home');
    navigate('/', { replace: true });
  };

  // Se timeout foi atingido e não há usuário, redireciona
  if (timeoutReached && !user) {
    return <Navigate to="/" replace />;
  }
  
  if (loading) {
    return <LoadingScreen 
      message="Verificando autenticação..." 
      showTimeout={true}
      onEscape={handleEscapeToHome}
    />;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 