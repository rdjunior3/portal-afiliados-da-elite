import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [processed, setProcessed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  
  useEffect(() => {
    console.log('🔗 [OAuthCallback] Iniciando processamento do callback OAuth...', {
      url: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      hasUser: !!user,
      isLoading: loading,
      attempts,
      elapsedTime: Math.round((Date.now() - startTime) / 1000) + 's'
    });
    
    // Aguardar o AuthContext processar o callback
    const processCallback = async () => {
      if (processed) return;
      
      const elapsedTime = Date.now() - startTime;
      
      // Se ainda está loading e não passou muito tempo, aguardar mais
      if (loading && attempts < 10 && elapsedTime < 20000) {
        console.log(`🔄 [OAuthCallback] Ainda processando... tentativa ${attempts + 1}/10 (${Math.round(elapsedTime/1000)}s)`);
        setAttempts(prev => prev + 1);
        return;
      }
      
      // Se tem usuário, redirecionar para dashboard
      if (user && !loading) {
        console.log('✅ [OAuthCallback] Usuário autenticado com sucesso!');
        setProcessed(true);
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // Se passou muito tempo sem sucesso, tentar buscar sessão manualmente
      if (!loading && attempts <= 5 && elapsedTime < 15000) {
        console.log('🔄 [OAuthCallback] Tentando buscar sessão manualmente...');
        setAttempts(prev => prev + 1);
        
        // Aguardar mais um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }
      
      // Se passou de 20s ou muitas tentativas, redirecionar para login
      if (elapsedTime >= 20000 || attempts >= 10) {
        console.log('❌ [OAuthCallback] Timeout excedido - redirecionando para login...', {
          elapsedTime: Math.round(elapsedTime/1000) + 's',
          attempts,
          hasUser: !!user,
          isLoading: loading
        });
        setProcessed(true);
        navigate('/login', { replace: true });
        return;
      }
    };
    
    // Processar com delay progressivo mais conservador
    const delay = Math.min(1500 + (attempts * 300), 2500);
    const timer = setTimeout(processCallback, delay);
    
    return () => clearTimeout(timer);
  }, [user, loading, navigate, processed, attempts, startTime]);
  
  // Se o usuário já está autenticado no início, redirecionar imediatamente
  useEffect(() => {
    if (user && !loading && !processed) {
      console.log('🚀 [OAuthCallback] Usuário já autenticado na inicialização, redirecionamento imediato...');
      setProcessed(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, processed]);
  
  const elapsedTime = Math.round((Date.now() - startTime) / 1000);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400 mx-auto"></div>
        <h2 className="text-white text-xl mt-4">Processando login com Google...</h2>
        
        {attempts === 0 && (
          <p className="text-slate-400 mt-2">Aguardando autenticação...</p>
        )}
        
        {attempts > 0 && attempts <= 5 && (
          <p className="text-slate-400 mt-2">
            Verificando sessão... ({elapsedTime}s)
          </p>
        )}
        
        {attempts > 5 && (
          <div className="mt-4">
            <p className="text-yellow-400 text-sm">
              ⏳ Processamento está demorando mais que o esperado
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Tentativa {attempts}/10 • {elapsedTime}s decorridos
            </p>
          </div>
        )}
        
        {elapsedTime > 15 && (
          <p className="text-orange-400 text-xs mt-2">
            🔄 Finalizando verificação...
          </p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback; 