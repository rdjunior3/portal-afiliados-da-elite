import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { Loading } from '@/components/ui/loading';

// Cache para componentes já carregados
const componentCache = new Map<string, LazyExoticComponent<any>>();

// Opções de configuração para lazy loading
interface LazyOptions {
  fallback?: ComponentType;
  preload?: boolean;
  chunkName?: string;
  timeout?: number;
}

/**
 * Hook personalizado para lazy loading com cache e controle de erro
 */
export function useLazyComponent<T = any>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  options: LazyOptions = {}
): LazyExoticComponent<ComponentType<T>> {
  const {
    fallback = () => <Loading message="Carregando componente..." />,
    preload = false,
    chunkName,
    timeout = 10000
  } = options;

  // Usar chunkName como chave de cache, ou função como string
  const cacheKey = chunkName || importFunction.toString();

  // Verificar se já está em cache
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey) as LazyExoticComponent<ComponentType<T>>;
  }

  // Criar wrapper com timeout
  const wrappedImport = () => {
    return Promise.race([
      importFunction(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Component load timeout')), timeout)
      )
    ]);
  };

  // Criar componente lazy
  const LazyComponent = lazy(wrappedImport);

  // Armazenar em cache
  componentCache.set(cacheKey, LazyComponent);

  // Preload se solicitado
  if (preload) {
    importFunction().catch(console.error);
  }

  return LazyComponent;
}

/**
 * Hook para preloading de componentes
 */
export function usePreloadComponents(
  components: Array<() => Promise<any>>,
  delay = 2000
) {
  const preload = () => {
    setTimeout(() => {
      components.forEach(component => {
        component().catch(console.error);
      });
    }, delay);
  };

  return { preload };
}

/**
 * Hook para limpar cache de componentes
 */
export function useClearComponentCache() {
  const clearCache = (chunkName?: string) => {
    if (chunkName) {
      componentCache.delete(chunkName);
    } else {
      componentCache.clear();
    }
  };

  const getCacheSize = () => componentCache.size;

  return { clearCache, getCacheSize };
}

// Componentes específicos com lazy loading otimizado
export const LazyComponents = {
  // Modal pesado para criação de produtos
  CreateProductModal: useLazyComponent(
    () => import('@/components/products/CreateProductModal'),
    { chunkName: 'create-product-modal', preload: true }
  ),
  
  // Editor de dicas da elite
  EliteTipsEditor: useLazyComponent(
    () => import('@/components/EliteTipsEditor'),
    { chunkName: 'elite-tips-editor' }
  ),
  
  // Manager de roles de usuário (admin)
  UserRoleManager: useLazyComponent(
    () => import('@/components/admin/UserRoleManager'),
    { chunkName: 'user-role-manager' }
  ),
  
  // Componente de chat (muito pesado)
  ChatInterface: useLazyComponent(
    () => import('@/components/chat/ChatInterface'),
    { chunkName: 'chat-interface', timeout: 15000 }
  ),
  
  // Dashboard de analytics
  AnalyticsDashboard: useLazyComponent(
    () => import('@/components/analytics/AnalyticsDashboard'),
    { chunkName: 'analytics-dashboard' }
  )
}; 