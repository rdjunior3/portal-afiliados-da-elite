/**
 * Sistema de Cache Avançado para Portal Afiliados da Elite
 * Implementa múltiplas estratégias de cache para otimização de performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
  key: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

class AdvancedCache {
  private cache = new Map<string, CacheItem<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  // TTL padrões para diferentes tipos de dados (em milissegundos)
  private readonly DEFAULT_TTL = {
    STATIC: 24 * 60 * 60 * 1000,      // 24 horas - dados estáticos
    DYNAMIC: 5 * 60 * 1000,           // 5 minutos - dados dinâmicos
    USER_DATA: 15 * 60 * 1000,        // 15 minutos - dados do usuário
    REAL_TIME: 30 * 1000,             // 30 segundos - dados em tempo real
    ANALYTICS: 60 * 60 * 1000,        // 1 hora - dados de analytics
  };

  /**
   * Armazena dados no cache com TTL específico
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL.DYNAMIC,
      key
    };

    this.cache.set(key, cacheItem);
    this.stats.sets++;
    this.stats.size = this.cache.size;

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗄️ [Cache] SET: ${key} (TTL: ${ttl || this.DEFAULT_TTL.DYNAMIC}ms)`);
    }
  }

  /**
   * Recupera dados do cache se ainda válidos
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      this.stats.size = this.cache.size;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏰ [Cache] EXPIRED: ${key}`);
      }
      
      return null;
    }

    this.stats.hits++;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [Cache] HIT: ${key}`);
    }
    
    return item.data;
  }

  /**
   * Remove item específico do cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ [Cache] DELETE: ${key}`);
      }
    }
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    this.stats.size = 0;
    
    console.log(`🧹 [Cache] CLEAR: ${size} items removidos`);
  }

  /**
   * Remove itens expirados do cache
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    this.stats.deletes += removed;
    this.stats.size = this.cache.size;

    if (removed > 0) {
      console.log(`🧹 [Cache] CLEANUP: ${removed} items expirados removidos`);
    }

    return removed;
  }

  /**
   * Invalida cache por padrão (ex: "products:*")
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let removed = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        removed++;
      }
    }

    this.stats.deletes += removed;
    this.stats.size = this.cache.size;

    console.log(`🔄 [Cache] INVALIDATE PATTERN: ${pattern} (${removed} items)`);
    return removed;
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Pré-aquece o cache com dados frequentemente acessados
   */
  async warmup(warmupFunctions: Array<() => Promise<void>>): Promise<void> {
    console.log('🔥 [Cache] Iniciando warmup...');
    
    const promises = warmupFunctions.map(async (fn, index) => {
      try {
        await fn();
        console.log(`✅ [Cache] Warmup ${index + 1}/${warmupFunctions.length} concluído`);
      } catch (error) {
        console.error(`❌ [Cache] Erro no warmup ${index + 1}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('🎉 [Cache] Warmup concluído!');
  }

  /**
   * TTL helpers para diferentes tipos de dados
   */
  getTTL() {
    return this.DEFAULT_TTL;
  }
}

// Instância singleton do cache
export const cache = new AdvancedCache();

// Auto-cleanup a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Hook para cache com React Query style
 */
export function useCacheKey(prefix: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `${prefix}:${paramString}`;
}

/**
 * Decorator para cache automático de funções
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // Tentar buscar do cache primeiro
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Executar função e cachear resultado
    try {
      const result = await fn(...args);
      cache.set(key, result, ttl);
      return result;
    } catch (error) {
      // Não cachear erros
      throw error;
    }
  }) as T;
}

/**
 * Utilitários para invalidação de cache específica
 */
export const cacheInvalidation = {
  // Invalida cache relacionado a produtos
  products: () => cache.invalidatePattern('products:*'),
  
  // Invalida cache relacionado a usuário específico
  user: (userId: string) => cache.invalidatePattern(`user:${userId}:*`),
  
  // Invalida cache relacionado a categorias
  categories: () => cache.invalidatePattern('categories:*'),
  
  // Invalida cache relacionado a comissões
  commissions: (userId?: string) => {
    if (userId) {
      cache.invalidatePattern(`commissions:${userId}:*`);
    } else {
      cache.invalidatePattern('commissions:*');
    }
  },
  
  // Invalida cache relacionado a analytics
  analytics: () => cache.invalidatePattern('analytics:*'),
  
  // Invalida tudo relacionado a um usuário
  userComplete: (userId: string) => {
    cache.invalidatePattern(`user:${userId}:*`);
    cache.invalidatePattern(`profile:${userId}:*`);
    cache.invalidatePattern(`commissions:${userId}:*`);
  }
};

export default cache; 