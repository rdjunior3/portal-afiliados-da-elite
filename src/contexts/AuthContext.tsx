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
      setLoading(false);
    }, 5000); // 5 seconds timeout

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        clearTimeout(loadingTimeout);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch or create profile
          let userProfile = await fetchProfile(session.user.id);
          
          if (!userProfile && event === 'SIGNED_IN') {
            // Create profile for new users
            userProfile = await createProfile(
              session.user, 
              session.user.user_metadata?.full_name
            );
          }
          
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session with timeout handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: Session | null }, error: any }>((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 3000)
          )
        ]);

        if (error) {
          console.error('Session check error:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
        
        clearTimeout(loadingTimeout);
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
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

  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      } else {
        setProfile(data);
        toast({
          title: "Perfil atualizado! ✅",
          description: "Suas informações foram salvas com sucesso.",
        });
      }

      return { error };
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
