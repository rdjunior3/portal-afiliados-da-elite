import { Outlet } from 'react-router-dom';
import ProvidersLayout from './layouts/ProvidersLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CacheDebugPanel from '@/components/debug/CacheDebugPanel';
import { cache } from '@/lib/cache';

// Configurar React Query com otimizações
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos (anteriormente cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Não tentar novamente para erros 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// Inicializar warmup do cache
if (typeof window !== 'undefined') {
  // Warmup básico do cache após carregamento
  setTimeout(() => {
    cache.warmup([
      // Funções de warmup serão implementadas conforme necessário
    ]);
  }, 2000);
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersLayout>
        <div className="App">
          <Outlet />
          
          {/* Painel de Debug do Cache - apenas em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && <CacheDebugPanel />}
          
          {/* React Query Devtools - apenas em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false} 
              position="bottom-left"
            />
          )}
        </div>
      </ProvidersLayout>
    </QueryClientProvider>
  );
}

export default App;
