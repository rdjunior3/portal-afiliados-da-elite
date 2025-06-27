// Função para detectar a URL base automaticamente
const getBaseUrl = () => {
  // Em produção no Vercel
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.origin;
    
    // Se está rodando no Vercel
    if (currentUrl.includes('vercel.app') || currentUrl.includes('portal-afiliados-da-elite')) {
      return currentUrl;
    }
    
    // Se está rodando localmente
    if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
      return currentUrl;
    }
    
    // Fallback para usar a origem atual
    return currentUrl;
  }
  
  // Fallback para SSR ou casos sem window
  return import.meta.env.VITE_BASE_URL || "http://localhost:8080";
};

export const env = {
  // Supabase - REMOVIDAS as credenciais hardcoded por segurança
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // App
  APP_TITLE: import.meta.env.VITE_APP_TITLE || "Portal Afiliados da Elite",
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || "Plataforma de afiliados premium",
  BASE_URL: getBaseUrl(),
  
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || "development",
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  
  // URLs de redirecionamento baseadas no ambiente
  REDIRECT_URL: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard',
  
  // Analytics
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
} as const;

// Validation - Mais rigorosa para garantir segurança
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !env[key]);
  
  if (missing.length > 0) {
    const errorMessage = `[ERROR] ERRO CRÍTICO: Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`;
    console.error(errorMessage);
    console.error('📝 Crie um arquivo .env na raiz do projeto com as seguintes variáveis:');
    console.error('VITE_SUPABASE_URL=sua_url_do_supabase');
    console.error('VITE_SUPABASE_ANON_KEY=sua_chave_anonima');
    
    // Em produção, lance erro para evitar funcionamento sem credenciais
    if (import.meta.env.PROD) {
      throw new Error('Configuração de ambiente inválida para produção');
    }
    
    return false;
  }
  
  // Validações adicionais de segurança
  if (env.SUPABASE_URL && !env.SUPABASE_URL.startsWith('https://')) {
    console.warn('[WARNING] AVISO: URL do Supabase deve usar HTTPS em produção');
  }
  
  console.log('[SUCCESS] Variáveis de ambiente validadas com sucesso');
  return true;
}

export default env; 