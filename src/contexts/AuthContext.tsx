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
  const [loading, setLoading] = useState(true); // Manter true até a inicialização completa
  const { toast } = useToast();

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

      // 1. Obter a sessão inicial
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [Auth] Erro ao obter sessão inicial:', sessionError);
      }

      if (initialSession) {
        console.log('✅ [Auth] Sessão inicial encontrada para:', initialSession.user.email);
        const currentUser = initialSession.user;
        setUser(currentUser);
        setSession(initialSession);
        
        // 2. Buscar perfil do usuário da sessão, tratando erros de forma segura
        try {
          const userProfile = await fetchProfile(currentUser.id);
          setProfile(userProfile);
          if (userProfile) {
            console.log('✅ [Auth] Perfil inicial carregado para:', userProfile.email);
          } else {
             console.warn('⚠️ [Auth] Perfil não encontrado para a sessão inicial.');
          }
        } catch (error) {
           console.error('💥 [Auth] Falha ao buscar perfil inicial:', error);
           // Não bloqueia o app, mas loga o erro. O listener pode tentar de novo.
        }

      } else {
        console.log('📭 [Auth] Nenhuma sessão inicial encontrada.');
      }
      
      setLoading(false);
      console.log('🏁 [Auth] Inicialização completa.');

      // 4. Configurar o listener para MUDANÇAS de estado de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log(`🔄 [Auth] Evento de mudança de estado: ${event}`, currentSession?.user?.email);
          setUser(currentSession?.user ?? null);
          setSession(currentSession);

          if (currentSession) {
            try {
              let userProfile = await fetchProfile(currentSession.user.id);

              // Só cria um perfil se ele REALMENTE não existir (null) após um SIGNED_IN
              if (userProfile === null && event === 'SIGNED_IN') {
                  console.log('🆕 [Auth] Perfil não encontrado após login, criando um novo...');
                  userProfile = await createProfile(
                    currentSession.user,
                    currentSession.user.user_metadata?.full_name
                  );
              }
              setProfile(userProfile);
              console.log('✅ [Auth] Perfil atualizado via listener para:', userProfile?.email);
            } catch (error) {
              console.error('💥 [Auth] Falha crítica ao buscar/criar perfil no listener. O perfil pode estar desatualizado:', error);
              // Em caso de erro (ex: timeout), não limpamos o perfil. 
              // É melhor manter dados antigos do que nenhum dado.
            }
          } else {
            // Se não houver sessão (SIGNED_OUT), limpar perfil
            setProfile(null);
            console.log('👋 [Auth] Usuário deslogado, perfil limpo.');
          }
        }
      );

      return () => {
        console.log('🧹 [Auth] Limpando listener de autenticação.');
        subscription.unsubscribe();
      };
    };

    initializeAndListen();
  }, []);

  // Enhanced fetch profile with timeout and retry
  const fetchProfile = async (userId: string) => {
    // Esta função agora lança um erro em caso de falha inesperada (ex: timeout)
    // e retorna 'null' apenas quando o perfil genuinamente não é encontrado.
    try {
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

      // Se houver um erro, mas NÃO for o erro 'not found', lance-o.
      if (error && error.code !== 'PGRST116') {
        console.error('❌ [fetchProfile] Erro inesperado ao buscar perfil:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [fetchProfile] Perfil carregado:', data?.email);
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
    console.log(`✍️ [signUp] Tentativa de cadastro para: ${email}`);
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
    console.log('🚪 [signOut] Tentativa de logout');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ [signOut] Erro:', error);
        toast({ title: 'Erro ao Sair', description: error.message, variant: 'destructive' });
      } else {
        console.log('✅ [signOut] Sucesso');
        // O listener onAuthStateChange cuidará de limpar o estado
        toast({ title: 'Logout Realizado', description: 'Você foi desconectado com sucesso.' });
      }
      return { error };
    } catch (error: any) {
      console.error('💥 [signOut] Erro inesperado:', error);
      toast({ title: 'Erro Crítico', description: error.message, variant: 'destructive' });
      return { error };
    } finally {
      setLoading(false);
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
      // O listener cuidará da transição de estado, não precisa de setLoading aqui
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
