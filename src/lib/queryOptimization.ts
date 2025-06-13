/**
 * Sistema de Otimização de Queries para Portal Afiliados da Elite
 * Implementa cache inteligente e otimizações específicas para queries frequentes
 */

import { supabase } from '@/integrations/supabase/client';
import { cache, withCache, useCacheKey } from './cache';

/**
 * Queries otimizadas para produtos
 */
export const optimizedProductQueries = {
  /**
   * Lista produtos com cache inteligente
   */
  getProducts: withCache(
    async (filters?: {
      category?: string;
      featured?: boolean;
      active?: boolean;
      limit?: number;
      offset?: number;
    }) => {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          short_description,
          price,
          original_price,
          commission_rate,
          commission_amount,
          image_url,
          thumbnail_url,
          sales_page_url,
          is_featured,
          is_active,
          total_sales,
          gravity_score,
          conversion_rate_avg,
          earnings_per_click,
          currency,
          tags,
          created_at,
          categories (
            id,
            name,
            slug,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('categories.slug', filters.category);
      }
      
      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }
      
      if (filters?.active !== undefined) {
        query = query.eq('is_active', filters.active);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    (filters) => useCacheKey('products:list', filters),
    cache.getTTL().DYNAMIC
  ),

  /**
   * Produto específico com cache longo
   */
  getProduct: withCache(
    async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            color,
            description
          ),
          product_offers (
            id,
            name,
            description,
            price,
            original_price,
            commission_rate,
            commission_amount,
            is_default,
            is_active,
            promotion_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    (id) => `products:detail:${id}`,
    cache.getTTL().STATIC
  ),

  /**
   * Produtos em destaque (cache longo)
   */
  getFeaturedProducts: withCache(
    async (limit = 6) => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          short_description,
          price,
          commission_rate,
          image_url,
          thumbnail_url,
          total_sales,
          gravity_score,
          categories (name, color)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('gravity_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    (limit) => `products:featured:${limit}`,
    cache.getTTL().STATIC
  )
};

/**
 * Queries otimizadas para categorias
 */
export const optimizedCategoryQueries = {
  /**
   * Lista todas as categorias (cache muito longo)
   */
  getCategories: withCache(
    async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    () => 'categories:all',
    cache.getTTL().STATIC
  ),

  /**
   * Categorias com contagem de produtos
   */
  getCategoriesWithCount: withCache(
    async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products!inner (count)
        `)
        .eq('is_active', true)
        .eq('products.is_active', true);

      if (error) throw error;
      return data;
    },
    () => 'categories:with-count',
    cache.getTTL().DYNAMIC
  )
};

/**
 * Queries otimizadas para perfil do usuário
 */
export const optimizedUserQueries = {
  /**
   * Perfil completo do usuário
   */
  getUserProfile: withCache(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          commissions!inner (
            id,
            amount,
            status,
            created_at,
            products (name, image_url)
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    (userId) => `user:profile:${userId}`,
    cache.getTTL().USER_DATA
  ),

  /**
   * Estatísticas do usuário
   */
  getUserStats: withCache(
    async (userId: string) => {
      const { data, error } = await supabase
        .rpc('get_user_stats', { user_id: userId });

      if (error) throw error;
      return data;
    },
    (userId) => `user:stats:${userId}`,
    cache.getTTL().ANALYTICS
  )
};

/**
 * Queries otimizadas para comissões
 */
export const optimizedCommissionQueries = {
  /**
   * Comissões do usuário com paginação
   */
  getUserCommissions: withCache(
    async (userId: string, filters?: {
      status?: string;
      limit?: number;
      offset?: number;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      let query = supabase
        .from('commissions')
        .select(`
          id,
          amount,
          status,
          created_at,
          paid_at,
          conversion_data,
          products (
            id,
            name,
            image_url,
            commission_rate
          ),
          product_offers (
            id,
            name,
            commission_rate
          )
        `)
        .eq('affiliate_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    (userId, filters) => useCacheKey(`commissions:user:${userId}`, filters),
    cache.getTTL().USER_DATA
  ),

  /**
   * Resumo de comissões do mês
   */
  getMonthlyCommissionSummary: withCache(
    async (userId: string, month?: string) => {
      const targetMonth = month || new Date().toISOString().slice(0, 7);
      
      const { data, error } = await supabase
        .rpc('get_monthly_commission_summary', {
          user_id: userId,
          target_month: targetMonth
        });

      if (error) throw error;
      return data;
    },
    (userId, month) => `commissions:monthly:${userId}:${month || 'current'}`,
    cache.getTTL().ANALYTICS
  )
};

/**
 * Queries otimizadas para Elite Tips
 */
export const optimizedEliteTipsQueries = {
  /**
   * Lista Elite Tips ativas
   */
  getEliteTips: withCache(
    async (limit = 10) => {
      const { data, error } = await supabase
        .from('elite_tips')
        .select(`
          id,
          title,
          content,
          icon,
          order_index,
          created_at,
          created_by,
          profiles!elite_tips_created_by_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    (limit) => `elite-tips:active:${limit}`,
    cache.getTTL().STATIC
  )
};

/**
 * Queries otimizadas para Analytics
 */
export const optimizedAnalyticsQueries = {
  /**
   * Dashboard analytics
   */
  getDashboardAnalytics: withCache(
    async (userId: string, period = '30d') => {
      const { data, error } = await supabase
        .rpc('get_dashboard_analytics', {
          user_id: userId,
          period: period
        });

      if (error) throw error;
      return data;
    },
    (userId, period) => `analytics:dashboard:${userId}:${period}`,
    cache.getTTL().ANALYTICS
  ),

  /**
   * Top produtos por performance
   */
  getTopPerformingProducts: withCache(
    async (limit = 5, period = '30d') => {
      const { data, error } = await supabase
        .rpc('get_top_performing_products', {
          limit_count: limit,
          period: period
        });

      if (error) throw error;
      return data;
    },
    (limit, period) => `analytics:top-products:${limit}:${period}`,
    cache.getTTL().ANALYTICS
  )
};

/**
 * Sistema de pré-carregamento para dados críticos
 */
export const preloadCriticalData = {
  /**
   * Pré-carrega dados essenciais para a dashboard
   */
  async dashboard(userId: string) {
    const promises = [
      optimizedUserQueries.getUserProfile(userId),
      optimizedUserQueries.getUserStats(userId),
      optimizedCommissionQueries.getMonthlyCommissionSummary(userId),
      optimizedProductQueries.getFeaturedProducts(6),
      optimizedCategoryQueries.getCategories(),
      optimizedEliteTipsQueries.getEliteTips(5)
    ];

    await Promise.allSettled(promises);
    console.log('🚀 [Preload] Dashboard data preloaded');
  },

  /**
   * Pré-carrega dados para a página de produtos
   */
  async products() {
    const promises = [
      optimizedProductQueries.getProducts({ limit: 20 }),
      optimizedProductQueries.getFeaturedProducts(6),
      optimizedCategoryQueries.getCategoriesWithCount()
    ];

    await Promise.allSettled(promises);
    console.log('🚀 [Preload] Products data preloaded');
  }
};

/**
 * Hooks para invalidação automática de cache
 */
export const cacheInvalidationHooks = {
  /**
   * Invalida cache quando produto é atualizado
   */
  onProductUpdate: (productId: string) => {
    cache.delete(`products:detail:${productId}`);
    cache.invalidatePattern('products:list:*');
    cache.invalidatePattern('products:featured:*');
    cache.invalidatePattern('analytics:*');
  },

  /**
   * Invalida cache quando comissão é criada/atualizada
   */
  onCommissionUpdate: (userId: string) => {
    cache.invalidatePattern(`commissions:user:${userId}:*`);
    cache.invalidatePattern(`commissions:monthly:${userId}:*`);
    cache.invalidatePattern(`user:stats:${userId}`);
    cache.invalidatePattern(`analytics:*`);
  },

  /**
   * Invalida cache quando perfil é atualizado
   */
  onProfileUpdate: (userId: string) => {
    cache.delete(`user:profile:${userId}`);
    cache.invalidatePattern(`user:stats:${userId}`);
  }
};

export {
  optimizedProductQueries as products,
  optimizedCategoryQueries as categories,
  optimizedUserQueries as users,
  optimizedCommissionQueries as commissions,
  optimizedEliteTipsQueries as eliteTips,
  optimizedAnalyticsQueries as analytics
}; 