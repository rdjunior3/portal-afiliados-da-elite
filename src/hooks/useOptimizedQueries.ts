/**
 * Hooks React otimizados com cache inteligente
 * Integração entre React Query e sistema de cache customizado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  products, 
  categories, 
  users, 
  commissions, 
  eliteTips, 
  analytics,
  cacheInvalidationHooks 
} from '@/lib/queryOptimization';
import { cache } from '@/lib/cache';

/**
 * Hook para produtos com cache otimizado
 */
export function useOptimizedProducts(filters?: {
  category?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['products', 'list', filters],
    queryFn: () => products.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para produto específico
 */
export function useOptimizedProduct(id: string) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => products.getProduct(id),
    staleTime: 24 * 60 * 60 * 1000, // 24 horas (dados estáticos)
    gcTime: 48 * 60 * 60 * 1000, // 48 horas
    enabled: !!id,
  });
}

/**
 * Hook para produtos em destaque
 */
export function useOptimizedFeaturedProducts(limit = 6) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => products.getFeaturedProducts(limit),
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 48 * 60 * 60 * 1000,
  });
}

/**
 * Hook para categorias
 */
export function useOptimizedCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categories.getCategories(),
    staleTime: 24 * 60 * 60 * 1000, // 24 horas (dados muito estáticos)
    gcTime: 48 * 60 * 60 * 1000,
  });
}

/**
 * Hook para categorias com contagem
 */
export function useOptimizedCategoriesWithCount() {
  return useQuery({
    queryKey: ['categories', 'with-count'],
    queryFn: () => categories.getCategoriesWithCount(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook para perfil do usuário
 */
export function useOptimizedUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => users.getUserProfile(userId),
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    enabled: !!userId,
  });
}

/**
 * Hook para estatísticas do usuário
 */
export function useOptimizedUserStats(userId: string) {
  return useQuery({
    queryKey: ['user', 'stats', userId],
    queryFn: () => users.getUserStats(userId),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
    enabled: !!userId,
  });
}

/**
 * Hook para comissões do usuário
 */
export function useOptimizedUserCommissions(
  userId: string, 
  filters?: {
    status?: string;
    limit?: number;
    offset?: number;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  return useQuery({
    queryKey: ['commissions', 'user', userId, filters],
    queryFn: () => commissions.getUserCommissions(userId, filters),
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000,
    enabled: !!userId,
  });
}

/**
 * Hook para resumo mensal de comissões
 */
export function useOptimizedMonthlyCommissions(userId: string, month?: string) {
  return useQuery({
    queryKey: ['commissions', 'monthly', userId, month],
    queryFn: () => commissions.getMonthlyCommissionSummary(userId, month),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 4 * 60 * 60 * 1000, // 4 horas
    enabled: !!userId,
  });
}

/**
 * Hook para Elite Tips
 */
export function useOptimizedEliteTips(limit = 10) {
  return useQuery({
    queryKey: ['elite-tips', 'active', limit],
    queryFn: () => eliteTips.getEliteTips(limit),
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 48 * 60 * 60 * 1000,
  });
}

/**
 * Hook para analytics do dashboard
 */
export function useOptimizedDashboardAnalytics(userId: string, period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'dashboard', userId, period],
    queryFn: () => analytics.getDashboardAnalytics(userId, period),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 4 * 60 * 60 * 1000,
    enabled: !!userId,
  });
}

/**
 * Hook para top produtos por performance
 */
export function useOptimizedTopProducts(limit = 5, period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'top-products', limit, period],
    queryFn: () => analytics.getTopPerformingProducts(limit, period),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 4 * 60 * 60 * 1000,
  });
}

/**
 * Mutations otimizadas com invalidação automática de cache
 */

/**
 * Mutation para atualizar produto
 */
export function useOptimizedProductUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Implementar update do produto
      // const { data: result, error } = await supabase...
      throw new Error('Implementar update do produto');
    },
    onSuccess: (data, variables) => {
      // Invalidar cache específico
      cacheInvalidationHooks.onProductUpdate(variables.id);
      
      // Invalidar React Query cache
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Mutation para criar/atualizar comissão
 */
export function useOptimizedCommissionUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      // Implementar update da comissão
      throw new Error('Implementar update da comissão');
    },
    onSuccess: (data, variables) => {
      // Invalidar cache específico
      cacheInvalidationHooks.onCommissionUpdate(variables.userId);
      
      // Invalidar React Query cache
      queryClient.invalidateQueries({ queryKey: ['commissions', 'user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user', 'stats', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Mutation para atualizar perfil
 */
export function useOptimizedProfileUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      // Implementar update do perfil
      throw new Error('Implementar update do perfil');
    },
    onSuccess: (data, variables) => {
      // Invalidar cache específico
      cacheInvalidationHooks.onProfileUpdate(variables.userId);
      
      // Invalidar React Query cache
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user', 'stats', variables.userId] });
    },
  });
}

/**
 * Hook para pré-carregamento de dados
 */
export function usePreloadData() {
  const queryClient = useQueryClient();
  
  const preloadDashboard = async (userId: string) => {
    const queries = [
      { queryKey: ['user', 'profile', userId], queryFn: () => users.getUserProfile(userId) },
      { queryKey: ['user', 'stats', userId], queryFn: () => users.getUserStats(userId) },
      { queryKey: ['commissions', 'monthly', userId], queryFn: () => commissions.getMonthlyCommissionSummary(userId) },
      { queryKey: ['products', 'featured', 6], queryFn: () => products.getFeaturedProducts(6) },
      { queryKey: ['categories', 'all'], queryFn: () => categories.getCategories() },
      { queryKey: ['elite-tips', 'active', 5], queryFn: () => eliteTips.getEliteTips(5) },
    ];

    await Promise.allSettled(
      queries.map(query => 
        queryClient.prefetchQuery({
          ...query,
          staleTime: 5 * 60 * 1000,
        })
      )
    );
  };

  const preloadProducts = async () => {
    const queries = [
      { queryKey: ['products', 'list'], queryFn: () => products.getProducts({ limit: 20 }) },
      { queryKey: ['products', 'featured', 6], queryFn: () => products.getFeaturedProducts(6) },
      { queryKey: ['categories', 'with-count'], queryFn: () => categories.getCategoriesWithCount() },
    ];

    await Promise.allSettled(
      queries.map(query => 
        queryClient.prefetchQuery({
          ...query,
          staleTime: 5 * 60 * 1000,
        })
      )
    );
  };

  return {
    preloadDashboard,
    preloadProducts,
  };
}

/**
 * Hook para estatísticas de cache
 */
export function useCacheStats() {
  return useQuery({
    queryKey: ['cache', 'stats'],
    queryFn: () => cache.getStats(),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Atualizar a cada 30 segundos
  });
}

/**
 * Hook para limpeza manual de cache
 */
export function useCacheManagement() {
  const queryClient = useQueryClient();
  
  const clearAllCache = () => {
    cache.clear();
    queryClient.clear();
  };

  const clearUserCache = (userId: string) => {
    cache.invalidatePattern(`user:${userId}:*`);
    cache.invalidatePattern(`commissions:${userId}:*`);
    queryClient.invalidateQueries({ queryKey: ['user'] });
    queryClient.invalidateQueries({ queryKey: ['commissions'] });
  };

  const clearProductsCache = () => {
    cache.invalidatePattern('products:*');
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return {
    clearAllCache,
    clearUserCache,
    clearProductsCache,
    cleanup: () => cache.cleanup(),
    getStats: () => cache.getStats(),
  };
} 