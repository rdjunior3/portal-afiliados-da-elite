import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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

  // Check if user can manage content/products
  const canManageContent = () => {
    return profile?.role === 'admin' || 
           profile?.role === 'super_admin';
  };

  // Fetch or create user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  // Create profile if it doesn't exist
  const createProfile = async (user: User, fullName?: string) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email!,
        first_name: fullName ? fullName.split(' ')[0] : '',
        last_name: fullName ? fullName.split(' ').slice(1).join(' ') : '',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'affiliate' as const, // Default role
        affiliate_status: 'pending' as const,
        commission_rate: 10.00,
        total_earnings: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout - setting loading to false');
      // Se não conseguiu carregar auth em 5 segundos, força usuário para login
      if (!session && !user) {
        console.log('Timeout sem sessão válida - redirecionando para login');
        setLoading(false);
      }
    }, 5000); // 5 seconds timeout

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        clearTimeout(loadingTimeout);
        
        // Log detalhado para debug
        if (event === 'SIGNED_OUT' || !session) {
          console.log('Usuário deslogado ou sem sessão válida');
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refresh - verificando validade');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Usuário autenticado, buscando perfil...');
          // Fetch or create profile
          let userProfile = await fetchProfile(session.user.id);
          
          if (!userProfile && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            console.log('Criando perfil para novo usuário...');
            // Create profile for new users
            userProfile = await createProfile(
              session.user, 
              session.user.user_metadata?.full_name
            );
          }
          
          setProfile(userProfile);
          console.log('Perfil carregado:', userProfile?.email);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: Session | null }, error: any }>((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 4000)
          )
        ]);

        if (error) {
          console.error('Session check error:', error);
          setLoading(false);
          return;
        }

        if (!session) {
          console.log('Nenhuma sessão ativa encontrada');
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('Sessão ativa encontrada:', session.user.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
          console.log('Perfil inicial carregado:', userProfile?.email);
        }
        
        clearTimeout(loadingTimeout);
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Em caso de erro, limpar tudo e direcionar para login
        setSession(null);
        setUser(null);
        setProfile(null);
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

  const updateProfile = async (updates: any) => {
    console.log('🚀 [updateProfile] INICIANDO...');
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
      console.log('🔄 [updateProfile] Tentando atualizar perfil do usuário:', user.id);
      
      // Preparar dados para atualização
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      console.log('📤 [updateProfile] Dados para envio:', updateData);
      
      // Tentar atualização com timeout de 30 segundos
      const updatePromise = supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 30 segundos')), 30000)
      );

      console.log('⏳ [updateProfile] Executando query no Supabase...');
      
      const { data, error } = await Promise.race([
        updatePromise,
        timeoutPromise
      ]) as any;

      console.log('📊 [updateProfile] Resposta do Supabase recebida');
      console.log('📊 [updateProfile] Data:', data);
      console.log('📊 [updateProfile] Error:', error);

      if (error) {
        console.error('❌ [updateProfile] Erro do Supabase:', error);
        console.error('❌ [updateProfile] Código do erro:', error.code);
        console.error('❌ [updateProfile] Mensagem do erro:', error.message);
        console.error('❌ [updateProfile] Detalhes completos:', JSON.stringify(error, null, 2));
        
        // Mensagens de erro específicas
        let errorMessage = 'Não foi possível atualizar o perfil. Tente novamente.';
        
        if (error.code === 'PGRST301' || error.message?.includes('permission')) {
          errorMessage = 'Sem permissão para atualizar o perfil. Verifique suas credenciais.';
        } else if (error.code === '23505' || error.message?.includes('duplicate')) {
          errorMessage = 'Este nome de usuário ou email já está em uso. Tente outro.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'A operação demorou muito. Verifique sua conexão.';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else if (error.message?.includes('constraint')) {
          errorMessage = 'Dados inválidos. Verifique as informações preenchidas.';
        } else if (error.message) {
          errorMessage = `Erro: ${error.message}`;
        }
        
        toast({
          title: "Erro ao Atualizar Perfil",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { error };
      }

      if (!data) {
        console.warn('⚠️ [updateProfile] Nenhum dado retornado, mas sem erro');
        
        // Tentar buscar o perfil atualizado
        const { data: fetchedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (fetchError) {
          console.error('❌ [updateProfile] Erro ao buscar perfil atualizado:', fetchError);
          return { error: fetchError };
        }
        
        console.log('✅ [updateProfile] Perfil buscado após update:', fetchedProfile);
        setProfile(fetchedProfile);
        
        return { error: null };
      }

      // Sucesso!
      console.log('✅ [updateProfile] Atualização bem-sucedida!');
      console.log('📊 [updateProfile] Perfil atualizado:', data);

      // Atualizar o estado local do perfil
      setProfile(data);
      
      console.log('🎉 [updateProfile] Estado local atualizado com sucesso');
      
      return { error: null };
    } catch (error: any) {
      console.error('💥 [updateProfile] Erro inesperado:', error);
      console.error('💥 [updateProfile] Stack trace:', error.stack);
      
      let errorMessage = 'Erro inesperado ao atualizar perfil.';
      
      if (error.message?.includes('Timeout')) {
        errorMessage = 'A operação demorou muito. Verifique sua conexão e tente novamente.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Erro de rede. Verifique sua conexão com a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro Inesperado",
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
