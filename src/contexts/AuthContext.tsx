import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseWithTimeout, withRetry } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { env } from '@/config/env';
import { validateEmail, RateLimiter, maskSensitiveData } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isModerator: () => boolean;
  canManageContent: () => boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true); // Manter true até a inicialização completa
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to check if user is admin
  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  // Helper function to check specific admin levels
  const isSuperAdmin = () => {
    return profile?.role === 'super_admin';
  };

  const isModerator = () => {
    return profile?.role === 'moderator';
  };

  // Check if user can manage content/products - Usado para agrupar permissões
  const canManageContent = () => {
    return profile?.role === 'admin' || 
           profile?.role === 'super_admin' || 
           profile?.role === 'moderator';
  };

  useEffect(() => {
    const initializeAndListen = async () => {
      setLoading(true);
      console.log('🚀 [Auth] Iniciando verificação de sessão...');

      // ⏰ TIMEOUT DE SEGURANÇA CRÍTICO
      const emergencyTimeout = setTimeout(() => {
        console.error('🚨 [Auth] TIMEOUT DE EMERGÊNCIA - Forçando loading = false');
        setLoading(false);
      }, 8000); // 8 segundos máximo

      // ✨ NOVA FUNCIONALIDADE: Detectar callback OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const isOAuthCallback = urlParams.has('code') || urlParams.has('access_token') || 
                              hashParams.has('access_token') || hashParams.has('refresh_token') ||
                              window.location.hash.includes('access_token') || 
                              window.location.hash.includes('refresh_token');
      
      if (isOAuthCallback) {
        console.log('🔗 [Auth] Callback OAuth detectado!', {
          url: window.location.href,
          search: window.location.search,
          hash: window.location.hash,
          urlParams: Object.fromEntries(urlParams),
          hashParams: Object.fromEntries(hashParams)
        });
      }

      // ✨ DEBUG: Log do estado atual da URL antes de qualquer manipulação
      console.log('📍 [Auth] Estado da URL:', {
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      });

      // ✨ NOVA FUNCIONALIDADE: Limpar tokens da URL automaticamente
      const currentUrl = window.location.href;
      if (currentUrl.includes('access_token=') || currentUrl.includes('refresh_token=')) {
        console.log('🧹 [Auth] Tokens encontrados na URL, aguardando processamento...');
        
        // ✨ DEBUG: Dar tempo para o Supabase processar antes de limpar
        setTimeout(() => {
          console.log('🧹 [Auth] Removendo tokens da URL por segurança...');
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }, 2000); // Aguarda 2 segundos para processamento
      }

      try {
        // 1. Obter a sessão inicial de forma mais rigorosa
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ [Auth] Erro ao obter sessão inicial:', sessionError);
          // Em caso de erro de sessão, garantir estado limpo
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (initialSession?.user) {
          console.log('✅ [Auth] Sessão inicial encontrada para:', maskSensitiveData(initialSession.user.email));
          
          // Verificação adicional: sessão não expirada
          const now = Math.floor(Date.now() / 1000);
          if (initialSession.expires_at && initialSession.expires_at < now) {
            console.log('⏰ [Auth] Sessão expirada, limpando estado');
            setUser(null);
            setSession(null);
            setProfile(null);
            setLoading(false);
            return;
          }
          
          const currentUser = initialSession.user;
          setUser(currentUser);
          setSession(initialSession);
          
          // 2. Buscar perfil do usuário da sessão, tratando erros de forma segura
          try {
            const userProfile = await fetchProfile(currentUser.id);
            setProfile(userProfile);
            if (userProfile) {
              console.log('✅ [Auth] Perfil inicial carregado para:', maskSensitiveData(userProfile.email));
              
              // 🚀 CORREÇÃO CRÍTICA: Redirecionamento robusto para admins
              if (userProfile.role === 'admin') {
                const currentPath = window.location.pathname;
                console.log('🎯 [Auth] Admin detectado na inicialização:', {
                  userEmail: maskSensitiveData(userProfile.email),
                  currentPath,
                  isOAuthCallback,
                  shouldRedirect: currentPath === '/' || currentPath === '/login' || isOAuthCallback
                });
                
                // Redirecionar se estiver na página inicial, login ou callback OAuth
                if (currentPath === '/' || currentPath === '/login' || isOAuthCallback) {
                  console.log('🚀 [Auth] Executando redirecionamento de admin...');
                  setTimeout(() => navigate('/dashboard'), 200);
                }
              }
            } else {
               console.warn('⚠️ [Auth] Perfil não encontrado para a sessão inicial.');
            }
          } catch (error) {
             console.error('💥 [Auth] Falha ao buscar perfil inicial:', error);
             // Não bloqueia o app, mas loga o erro. O listener pode tentar de novo.
          }

        } else {
          console.log('📭 [Auth] Nenhuma sessão inicial encontrada.');
          // Garantir estado limpo
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('💥 [Auth] Erro crítico na inicialização:', error);
        // Em caso de erro crítico, garantir estado limpo
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      
      // Limpar timeout de emergência
      clearTimeout(emergencyTimeout);
      setLoading(false);
      console.log('🏁 [Auth] Inicialização completa.');

      // ✨ LISTENER DE MUDANÇAS DE AUTENTICAÇÃO - com logs detalhados
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`🔄 [Auth] Evento de autenticação: ${event}`, {
          event,
          session: session ? {
            user: session.user ? {
              id: session.user.id,
              email: session.user.email,
              user_metadata: session.user.user_metadata,
              app_metadata: session.user.app_metadata
            } : null,
            expires_at: session.expires_at,
            access_token: session.access_token ? '***presente***' : 'ausente'
          } : null,
          timestamp: new Date().toISOString()
        });

        setUser(session?.user ?? null);
        setSession(session);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [Auth] Usuário logado com sucesso!', {
            userId: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider || 'email'
          });
          
          try {
            console.log('👤 [Auth] Buscando perfil do usuário...');
            
            // Buscar perfil existente
            let userProfile = await fetchProfile(session.user.id);
            
            // Se não existe perfil, criar um novo (especialmente para login Google)
            if (!userProfile && session.user.app_metadata?.provider === 'google') {
              console.log('🔨 [Auth] Criando perfil para usuário Google...');
              userProfile = await createProfile(session.user, session.user.user_metadata?.full_name);
            }
            
            if (userProfile) {
              setProfile(userProfile);
              console.log('✅ [Auth] Perfil carregado/criado:', maskSensitiveData(userProfile.email));
            }
            
            // ✨ REDIRECIONAMENTO APÓS LOGIN GOOGLE
            if (session.user.app_metadata?.provider === 'google') {
              console.log('🌐 [Auth] Login Google detectado, redirecionando para dashboard...');
              // Aguarda um pouco para garantir que o perfil foi carregado
              setTimeout(() => {
                navigate('/dashboard');
              }, 500);
            }
          } catch (error) {
            console.error('❌ [Auth] Erro ao carregar perfil após login:', error);
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 [Auth] Usuário deslogado');
          setProfile(null);
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 [Auth] Token renovado');
        }

        setLoading(false);
      });

      return () => {
        console.log('🧹 [Auth] Limpando listener de autenticação.');
        subscription.unsubscribe();
      };
    };

    initializeAndListen();
  }, [navigate]);

  // Enhanced fetch profile with timeout and retry
  const fetchProfile = async (userId: string) => {
    // Esta função agora lança um erro em caso de falha inesperada (ex: timeout)
    // e retorna 'null' apenas quando o perfil genuinamente não é encontrado.
    console.log(`🔍 [fetchProfile] Buscando perfil para userId: ${userId}`);
    try {
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

      // Log do resultado da query
      console.log('📊 [fetchProfile] Resultado da query:', { data: data?.email, error: error?.code });

      // Se houver um erro, mas NÃO for o erro 'not found', lance-o.
      if (error && error.code !== 'PGRST116') {
        console.error('❌ [fetchProfile] Erro inesperado ao buscar perfil:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [fetchProfile] Perfil carregado:', maskSensitiveData(data?.email), 'Role:', data?.role);
      } else {
        console.log('🤔 [fetchProfile] Perfil não encontrado (código PGRST116).');
      }

      return data; // Retorna os dados do perfil ou null se não for encontrado.
    } catch (error) {
      console.error('💥 [fetchProfile] Erro pego no catch block:', error);
      throw error; // Re-lança o erro para que a função chamadora possa tratá-lo.
    }
  };

  // Create profile if it doesn't exist
  const createProfile = async (user: User, fullName?: string) => {
    try {
      console.log('🔨 [createProfile] Criando perfil...');
      
      const profileData = {
        id: user.id,
        email: user.email!,
        first_name: fullName ? fullName.split(' ')[0] : '',
        last_name: fullName ? fullName.split(' ').slice(1).join(' ') : '',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'affiliate' as const,
        affiliate_status: 'pending' as const,
        commission_rate: 10.00,
        total_earnings: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();
      }, 2, 2000);

      if (error) {
        console.error('❌ [createProfile] Erro:', error);
        return null;
      }

      console.log('✅ [createProfile] Perfil criado:', data?.email);
      return data;
    } catch (error) {
      console.error('💥 [createProfile] Erro inesperado:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Validações de segurança
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Erro no cadastro",
        description: "Email inválido",
        variant: "destructive",
      });
      return { error: new Error('Email inválido') };
    }

    // Rate limiting
    const rateLimitKey = `signup_${emailValidation.sanitized}`;
    if (!RateLimiter.isAllowed(rateLimitKey, 3, 15 * 60 * 1000)) { // 3 tentativas por 15 min
      toast({
        title: "Muitas tentativas",
        description: "Aguarde alguns minutos antes de tentar novamente",
        variant: "destructive",
      });
      return { error: new Error('Rate limit exceeded') };
    }

    console.log(`✍️ [signUp] Tentativa de cadastro para: ${maskSensitiveData(email)}`);
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email: emailValidation.sanitized,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) {
        let errorMessage = 'Erro no cadastro. Tente novamente.';
        
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Senha deve ter pelo menos 6 caracteres.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Email inválido.';
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        if (data.user && !data.session) {
          toast({
            title: "Cadastro realizado! 🎉",
            description: "Verifique seu email para confirmar a conta e acessar a plataforma.",
          });
        } else {
          toast({
            title: "Bem-vindo à Elite! 🚀",
            description: "Sua conta foi criada com sucesso!",
          });
        }
      }

      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Validações de segurança
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Erro no login",
        description: "Email inválido",
        variant: "destructive",
      });
      return { error: new Error('Email inválido') };
    }

    // Rate limiting para tentativas de login
    const rateLimitKey = `signin_${emailValidation.sanitized}`;
    if (!RateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) { // 5 tentativas por 15 min
      toast({
        title: "Muitas tentativas de login",
        description: "Conta temporariamente bloqueada. Tente novamente em 15 minutos",
        variant: "destructive",
      });
      return { error: new Error('Rate limit exceeded') };
    }

    console.log(`🔑 [signIn] Tentativa de login para: ${maskSensitiveData(email)}`);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitized,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: "Credenciais inválidas. Verifique seu email e senha.",
          variant: "destructive",
        });
        return { error };
      }
      
      console.log('✅ [signIn] Login bem-sucedido, aguardando redirecionamento do listener...');
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo de volta!",
        variant: "success",
      });
      return { error: null };
    } catch (error: any) {
      console.error('💥 [signIn] Erro inesperado:', error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('👋 [signOut] Tentativa de logout...');
    setLoading(true); // Inicia o carregamento para a transição
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [signOut] Erro:', error);
        toast({
          title: "Erro ao sair",
          description: "Não foi possível fazer o logout. Tente novamente.",
          variant: "destructive",
        });
        return { error };
      }
      
      // Limpeza manual imediata dos estados para garantir que a UI reaja
      setUser(null);
      setSession(null);
      setProfile(null);
      
      navigate('/', { replace: true }); // Redireciona para a página inicial
      
      console.log('✅ [signOut] Logout bem-sucedido e redirecionado.');
      toast({
        title: "Você saiu!",
        description: "Até a próxima!",
        variant: "info",
      });

      return { error: null };
    } catch (error: any) {
      console.error('💥 [signOut] Erro inesperado:', error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('🌐 [signInWithGoogle] Tentando login com Google...');
    setLoading(true);
    
    try {
      // Limpar qualquer sessão antiga que possa estar causando conflito
      await supabase.auth.signOut();
      
      // Detectar se estamos em localhost ou produção
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocalhost ? 'http://localhost:5173' : 'https://www.afiliadosdaelite.com.br';
      
      // 🚀 CORREÇÃO CRÍTICA: Usar rota específica para callback OAuth
      const redirectUrl = `${baseUrl}/auth/callback`;
      
      console.log('🔗 [signInWithGoogle] Configuração:', {
        hostname: window.location.hostname,
        origin: window.location.origin,
        baseUrl,
        redirectUrl,
        isLocalhost
      });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Força seleção de conta
          }
        }
      });

      if (error) {
        console.error('❌ [signInWithGoogle] Erro detalhado:', error);
        toast({
          title: "Erro no login com Google",
          description: `Não foi possível conectar com o Google: ${error.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return { error };
      }

      console.log('✅ [signInWithGoogle] Redirecionamento iniciado para Google');
      // Não resetamos o loading aqui pois o usuário será redirecionado
      return { error: null };
    } catch (error: any) {
      console.error('💥 [signInWithGoogle] Erro inesperado:', error);
      toast({
        title: "Erro Inesperado no Google Login",
        description: "Ocorreu um erro durante o login com Google. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    console.log(`🔑 [resetPassword] Tentativa de reset para: ${email}`);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.REDIRECT_URL}/reset-password`,
      });

      if (error) {
        console.error('❌ [resetPassword] Erro:', error);
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        console.log('✅ [resetPassword] E-mail de recuperação enviado');
        toast({ title: 'Verifique seu E-mail', description: 'Um link para redefinir sua senha foi enviado.' });
      }
      return { error };
    } catch (error: any) {
      console.error('💥 [resetPassword] Erro inesperado:', error);
      toast({ title: 'Erro Crítico', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) {
      const error = new Error('Usuário não autenticado');
      console.error('❌ [updateProfile] Tentativa de atualização sem usuário');
      toast({ title: 'Não autenticado', description: 'Você precisa estar logado para atualizar seu perfil.', variant: 'destructive' });
      return { error };
    }

    console.log('🔄 [updateProfile] Atualizando perfil...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ [updateProfile] Erro:', error);
        toast({ title: 'Erro ao Atualizar', description: error.message, variant: 'destructive' });
      } else {
        console.log('✅ [updateProfile] Perfil atualizado:', data?.email);
        setProfile(data); // Atualiza o perfil no contexto
        toast({ title: 'Sucesso', description: 'Seu perfil foi atualizado.' });
      }
      return { error };
    } catch (error: any) {
      console.error('💥 [updateProfile] Erro inesperado:', error);
      toast({ title: 'Erro Crítico', description: error.message, variant: 'destructive' });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        isAdmin,
        isSuperAdmin,
        isModerator,
        canManageContent,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
