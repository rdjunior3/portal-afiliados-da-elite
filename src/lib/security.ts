/**
 * Utilitários de Segurança - Portal Afiliados da Elite
 * 
 * Este arquivo contém funções para validação, sanitização e proteção
 * contra vulnerabilidades comuns como XSS, SQL Injection, etc.
 */

/**
 * Sanitiza string removendo tags HTML e caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Valida se uma URL é segura
 */
export function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // Bloquear URLs suspeitas
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /on\w+=/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
}

/**
 * Valida e sanitiza email
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string } {
  const sanitized = sanitizeString(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return {
    isValid: emailRegex.test(sanitized) && sanitized.length <= 254,
    sanitized
  };
}

/**
 * Valida UUID para prevenir ataques de injeção
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Rate limiting simples baseado em localStorage
 */
export class RateLimiter {
  private static prefix = 'rate_limit_';
  
  static isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const storageKey = `${this.prefix}${key}`;
    
    try {
      const stored = localStorage.getItem(storageKey);
      const requests = stored ? JSON.parse(stored) : [];
      
      // Remove requests antigos
      const validRequests = requests.filter((timestamp: number) => 
        now - timestamp < windowMs
      );
      
      if (validRequests.length >= maxRequests) {
        return false;
      }
      
      validRequests.push(now);
      localStorage.setItem(storageKey, JSON.stringify(validRequests));
      
      return true;
    } catch {
      // Se houver erro no localStorage, permitir a requisição
      return true;
    }
  }
  
  static reset(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch {
      // Ignorar erros
    }
  }
}

/**
 * Gera token CSRF simples para proteção
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida token CSRF
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}

/**
 * Máscara para dados sensíveis em logs
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) {
    return '*'.repeat(data?.length || 0);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(data.length - (visibleChars * 2));
  
  return `${start}${middle}${end}`;
}

/**
 * Configurações de segurança para headers HTTP
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
} as const;

/**
 * Lista de domínios confiáveis para CORS
 */
export const TRUSTED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'www.afiliadosdaelite.com.br',
  'afiliadosdaelite.com.br',
  // Adicionar outros domínios confiáveis conforme necessário
] as const;

/**
 * Verifica se um domínio é confiável
 */
export function isTrustedDomain(domain: string): boolean {
  const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
  return TRUSTED_DOMAINS.some(trusted => 
    normalizedDomain === trusted || normalizedDomain.endsWith(`.${trusted}`)
  );
} 