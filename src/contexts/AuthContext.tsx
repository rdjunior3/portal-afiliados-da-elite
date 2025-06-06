import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseWithTimeout, withRetry } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { env } from '@/config/env';

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to check if user is admin
  const isAdmin = () => {
    return profile?.role === 'admin' || 
           profile?.role === 'super_admin' || 
           profile?.role === 'moderator';
  };

  // Helper function to check specific admin levels
  const isSuperAdmin = () => {
    return profile?.role === 'super_admin';
  };

  const isModerator = () => {
    return profile?.role === 'moderator' || 
           profile?.role === 'admin' || 
           profile?.role === 'super_admin';
  };

  // Check if user can manage content/products - TODOS OS TIPOS DE ADMIN
  const canManageContent = () => {
    return profile?.role === 'admin' || 
           profile?.role === 'super_admin' || 
           profile?.role === 'moderator';
  };

  // Enhanced fetch profile with timeout and retry
  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 [fetchProfile] Buscando perfil com timeout estendido...');
      
      const { data, error } = await withRetry(async () => {
        return await Promise.race([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 20000) // 20s timeout
          )
        ]);
      }, 2, 2000);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [fetchProfile] Erro:', error);
        return null;
      }

      console.log('✅ [fetchProfile] Perfil carregado:', data?.email);
      return data;
    } catch (error) {
      console.error('💥 [fetchProfile] Erro inesperado:', error);
      return null;
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

  useEffect(() => {
    // TIMEOUT AUMENTADO PARA 20 SEGUNDOS
    const loadingTimeout = setTimeout(() => {
      console.warn('⏰ Auth initialization timeout (20s) - setting loading to false');
      setLoading(false);
    }, 20000); // Aumentado para 20 segundos

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        
        clearTimeout(loadingTimeout);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('👋 Usuário deslogado ou sem sessão válida');
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refresh - verificando validade');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário autenticado, buscando perfil...');
          
          try {
            let userProfile = await fetchProfile(session.user.id);
            
            if (!userProfile && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              console.log('🆕 Criando perfil para novo usuário...');
              userProfile = await createProfile(
                session.user, 
                session.user.user_metadata?.full_name
              );
            }
            
            setProfile(userProfile);
            console.log('✅ Perfil carregado:', userProfile?.email);

            // Redirecionamento após login
            if (event === 'SIGNED_IN' && userProfile && window.location.pathname !== '/dashboard') {
              console.log('🎯 Login detectado, redirecionando para dashboard...');
              
              // Todos os usuários autenticados vão direto para o dashboard
              // Podem completar o perfil através das configurações quando necessário
              setTimeout(() => window.location.href = '/dashboard', 200);
            }
          } catch (error) {
            console.error('💥 Erro ao buscar perfil:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Enhanced auth initialization with timeout
    const initializeAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticação com timeout estendido...');
        
        const { data: { session }, error } = await supabaseWithTimeout.auth.getSession();

        if (error) {
          console.error('❌ Session check error:', error);
          setLoading(false);
          return;
        }

        if (!session) {
          console.log('📭 Nenhuma sessão ativa encontrada');
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('✅ Sessão ativa encontrada:', session.user.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            console.log('✅ Perfil inicial carregado:', userProfile?.email);
          } catch (error) {
            console.error('⚠️ Erro ao buscar perfil inicial:', error);
            setProfile(null);
          }
        }
        
        clearTimeout(loadingTimeout);
        setLoading(false);
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        console.warn('⏰ Timeout na inicialização - mantendo estados atuais');
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
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
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Erro no login. Verifique suas credenciais.';
        
        if (error.message.includes('credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.message.includes('confirmed')) {
          errorMessage = 'Confirme seu email antes de fazer login.';
        } else if (error.message.includes('blocked')) {
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado! 🎉",
          description: "Bem-vindo de volta à Elite!",
        });

        // Não fazer redirecionamento aqui - deixar o onAuthStateChange controlar
        // O redirecionamento será feito automaticamente quando o perfil for carregado
      }

      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // PASSO 1: Limpar estados IMEDIATAMENTE para evitar travamento
      setLoading(false); // Força loading = false primeiro
      setUser(null);
      setSession(null);
      setProfile(null);
    
      // PASSO 2: Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        toast({
          title: "Erro ao sair",
          description: "Não foi possível sair completamente. Você foi desconectado localmente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Até a próxima!",
        });
      }

      // PASSO 3: Garantir que estados permaneçam limpos
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);

      return { error };
    } catch (error) {
      console.error('Erro durante logout:', error);
      
      // PASSO 4: Mesmo com erro, força limpeza total
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      
      toast({
        title: "Logout realizado",
        description: "Sua sessão foi encerrada com sucesso.",
      });
      
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Erro detalhado do Google OAuth:', error);
        toast({
          title: "Erro no login com Google",
          description: `Não foi possível conectar com o Google: ${error.message}`,
          variant: "destructive",
        });
      }

      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        let errorMessage = 'Erro ao enviar email de recuperação.';
        
        if (error.message.includes('not found')) {
          errorMessage = 'Email não encontrado em nossa base de dados.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Email inválido.';
        }
        
        toast({
          title: "Erro na recuperação",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado! 📧",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
      }

      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced updateProfile with proper timeout handling
  const updateProfile = async (updates: any) => {
    console.log('🚀 [updateProfile] INICIANDO com timeout estendido...');
    console.log('📝 [updateProfile] Dados recebidos:', updates);
    
    if (!user) {
      console.error('❌ [updateProfile] Usuário não autenticado');
      const error = new Error('User not authenticated');
      
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para atualizar o perfil. Faça login novamente.",
        variant: "destructive",
      });
      
      return { error };
    }
    
    try {
      console.log('⏳ [updateProfile] Usando função com timeout estendido...');
      
      // Usar a nova função com timeout estendido e retry
      const response = await withRetry(async () => {
        return await supabaseWithTimeout.profiles.update({
          ...updates,
          updated_at: new Date().toISOString()
        }, user.id);
      }, 3, 2000); // 3 retries, 2s delay

      if (response.error) {
        throw response.error;
      }

      if (response.data) {
        setProfile(response.data);
        console.log('🎉 [updateProfile] Estado local atualizado com sucesso');
      } else {
        console.warn('⚠️ [updateProfile] Nenhum dado retornado, buscando perfil...');
        
        try {
          const userProfile = await fetchProfile(user.id);
          if (userProfile) {
            setProfile(userProfile);
            console.log('✅ [updateProfile] Perfil buscado após update');
          }
        } catch (fetchError) {
          console.error('❌ [updateProfile] Erro ao buscar perfil atualizado:', fetchError);
        }
      }
      
      console.log('✅ [updateProfile] Operação concluída com sucesso');
      return { error: null };
      
    } catch (error: any) {
      console.error('💥 [updateProfile] Erro após todas as tentativas:', error);
      
      let errorMessage = 'Erro ao atualizar perfil após múltiplas tentativas.';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'A operação está demorando muito. Sua conexão pode estar lenta. Tente novamente em alguns minutos.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Erro de rede. Verifique sua conexão com a internet e tente novamente.';
      } else if (error.code === 'PGRST301' || error.message?.includes('permission')) {
        errorMessage = 'Sem permissão para atualizar o perfil. Faça login novamente.';
      } else if (error.code === '23505' || error.message?.includes('duplicate')) {
        errorMessage = 'Este nome de usuário já está em uso. Tente outro.';
      } else if (error.message?.includes('constraint')) {
        errorMessage = 'Dados inválidos. Verifique as informações preenchidas.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao Atualizar Perfil",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
