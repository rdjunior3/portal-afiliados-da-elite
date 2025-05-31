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
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "https://rbqzddsserknaedojuex.supabase.co",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJicXpkZHNzZXJrbmFlZG9qdWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjE4NjYsImV4cCI6MjA2NDE5Nzg2Nn0.HU4i2JyLdV6c3CGUp5Ww-9doAELnReyFab7JPpiQWb4",
  
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

// Validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using fallback values. App functionality may be limited.');
    // Don't throw error, just warn
    return false;
  }
  
  console.log('✅ Environment variables validated successfully');
  return true;
}

export default env; 