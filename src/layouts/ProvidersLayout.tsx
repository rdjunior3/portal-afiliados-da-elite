import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from 'next-themes'; // Importar o ThemeProvider
import { Toaster } from '@/components/ui/sonner'; // Corrigido para sonner, que é o que está no package.json
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading';

/**
 * Componente interno que lida com o estado de carregamento da autenticação.
 * Ele deve ser um filho do AuthProvider para usar o hook useAuth.
 */
const AuthLoadingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Agora usamos o hook useAuth a partir de um componente filho do AuthProvider.
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Carregando sessão..." />;
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
