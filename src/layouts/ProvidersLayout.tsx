import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading';

/**
 * Componente interno que lida com o estado de carregamento da autenticação.
 * Ele deve ser um filho do AuthProvider para usar o hook useAuth.
 */
const AuthLoadingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [AuthLoadingGate] Timeout atingido, forçando carregamento');
        setTimeoutReached(true);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [loading]);

  // Se o timeout foi atingido, continuar independente do loading
  if (loading && !timeoutReached) {
    return <LoadingScreen message="Carregando sessão..." />;
  }

  if (timeoutReached && loading) {
    console.log('🚨 [AuthLoadingGate] Timeout de carregamento - continuando sem auth');
  }

  return <>{children}</>;
};

/**
 * Layout principal que envolve a aplicação com todos os provedores de contexto necessários.
 * Garante que o AuthProvider esteja disponível para os hooks de autenticação
 * e o QueryProvider para as chamadas de dados.
 */
const ProvidersLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          <AuthProvider>
            <AuthLoadingGate>
              {children}
              <Toaster />
            </AuthLoadingGate>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default ProvidersLayout;
