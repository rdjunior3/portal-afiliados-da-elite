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
  const { loading, user } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Detectar se é carregamento inicial ou logout
  useEffect(() => {
    if (!loading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, isInitialLoad]);

  // Timeout de segurança para evitar loading infinito - APENAS no carregamento inicial
  useEffect(() => {
    // ✅ OTIMIZAÇÃO: Não bloquear durante logout (quando user estava presente e agora loading=true)
    const isLogoutProcess = !isInitialLoad && !user && loading;
    
    if (isLogoutProcess) {
      console.log('🚪 [AuthLoadingGate] Processo de logout detectado - não bloqueando');
      return; // Não criar timeout durante logout
    }

    const timer = setTimeout(() => {
      if (loading && isInitialLoad) {
        console.warn('⚠️ [AuthLoadingGate] Timeout atingido, forçando carregamento');
        setTimeoutReached(true);
      }
    }, 8000); // ⚡ REDUZIDO: 8 segundos em vez de 10

    return () => clearTimeout(timer);
  }, [loading, isInitialLoad, user]);

  // ✅ OTIMIZAÇÃO: Se é processo de logout, não mostrar loading screen
  const isLogoutProcess = !isInitialLoad && !user && loading;
  
  if (isLogoutProcess) {
    console.log('🔄 [AuthLoadingGate] Logout em andamento - permitindo renderização');
    return <>{children}</>;
  }

  // Se o timeout foi atingido OU não é carregamento inicial, continuar
  if ((loading && !timeoutReached && isInitialLoad)) {
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
