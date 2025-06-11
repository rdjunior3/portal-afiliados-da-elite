import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Cache para componentes lazy
const componentCache = new Map<string, LazyExoticComponent<any>>();

/**
 * Wrapper para lazy loading com cache
 */
export function createLazyComponent<T = any>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  chunkName?: string
): LazyExoticComponent<ComponentType<T>> {
  const cacheKey = chunkName || importFunction.toString();
  
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey) as LazyExoticComponent<ComponentType<T>>;
  }

  const LazyComponent = lazy(importFunction);
  componentCache.set(cacheKey, LazyComponent);
  
  return LazyComponent;
}

/**
 * Preload de componentes para melhor UX
 */
export function preloadComponent(
  importFunction: () => Promise<any>,
  delay = 1000
): void {
  setTimeout(() => {
    importFunction().catch(console.error);
  }, delay);
}

/**
 * Debounce para inputs de busca
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle para scroll e resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Intersection Observer para lazy loading de imagens/componentes
 */
export function createIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
}

/**
 * Otimização de performance para queries React Query
 */
export const queryOptimization = {
  // Stale time otimizado por tipo de dado
  staleTime: {
    static: 30 * 60 * 1000,      // 30 min para dados estáticos
    userProfile: 10 * 60 * 1000, // 10 min para perfil
    products: 5 * 60 * 1000,     // 5 min para produtos
    realtime: 30 * 1000          // 30 seg para dados em tempo real
  },
  
  // Cache time otimizado
  cacheTime: {
    long: 24 * 60 * 60 * 1000,   // 24h para dados raramente alterados
    medium: 60 * 60 * 1000,      // 1h para dados normais
    short: 5 * 60 * 1000         // 5 min para dados frequentes
  }
};

/**
 * Monitor de performance para desenvolvimento
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  static start(label: string): void {
    this.measurements.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`Performance measurement "${label}" was not started`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    this.measurements.delete(label);
    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
}

/**
 * Hook para detectar mudanças de rede
 */
export function getNetworkInfo() {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false
    };
  }
  return null;
}

/**
 * Configuração adaptativa baseada na conexão
 */
export function getAdaptiveConfig() {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    const isSlowConnection = 
      connection?.effectiveType === 'slow-2g' || 
      connection?.effectiveType === '2g' ||
      connection?.saveData;

    return {
      imageQuality: isSlowConnection ? 'low' : 'high',
      enableAnimations: !isSlowConnection,
      chunkSize: isSlowConnection ? 'small' : 'normal',
      preloadComponents: !isSlowConnection
    };
  }
  
  return { imageQuality: 'high', enableAnimations: true, chunkSize: 'normal', preloadComponents: true };
} 