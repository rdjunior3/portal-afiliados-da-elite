import React from 'react';
import { QueryClient, QueryClientProvider, QueryClientConfig } from '@tanstack/react-query';

// Configuração padrão que pode ser usada ao criar um novo client
export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error: any) => {
        // Não retry em erros de autenticação
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry até 3 vezes para outros erros
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
};

interface QueryProviderProps {
  children: React.ReactNode;
  client?: QueryClient; 
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children, client }) => {
  const [queryClient] = React.useState(() => client || new QueryClient(defaultQueryClientConfig));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider; 