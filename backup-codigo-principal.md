# BACKUP - Código Principal do Portal Afiliados da Elite

## 📄 ARQUIVOS DE CÓDIGO FONTE

### src/App.tsx
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import { usePageTracking, usePerformanceMonitoring } from './hooks/useAnalytics';
import { validateEnv } from './config/env';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Dashboard Pages
import Products from './pages/dashboard/Products';
import Links from './pages/dashboard/Links';
import Analytics from './pages/dashboard/Analytics';
import Commissions from './pages/dashboard/Commissions';
import Payments from './pages/dashboard/Payments';
import Reports from './pages/dashboard/Reports';
import Profile from './pages/dashboard/Profile';
import Notifications from './pages/dashboard/Notifications';
import Settings from './pages/dashboard/Settings';

// Validar variáveis de ambiente no carregamento
try {
  validateEnv();
} catch (error) {
  console.error('❌ Erro de configuração:', error);
}

function AppContent() {
  usePageTracking();
  usePerformanceMonitoring();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Dashboard Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="links" element={<Links />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch-all route - redireciona qualquer rota não encontrada para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryProvider>
      <Router>
        <AuthProvider>
          <div className="App">
            <AppContent />
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryProvider>
  );
}

export default App;
```

### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### src/lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { Database } from '../types/database.types';

// Configuração do cliente Supabase
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
```

### src/config/env.ts
```typescript
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
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export default env;
```

### src/components/ProtectedRoute.tsx
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

### src/contexts/AuthContext.tsx (parcial - primeiras 100 linhas)
```typescript
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, signUp, signIn, signOut, signInWithGoogle, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📂 SCRIPTS DE BANCO DE DADOS

### scripts/apply-migrations.js
```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbqzddsserknaedojuex.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY não definida');
  console.log('Por favor, defina a variável de ambiente SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL(sql) {
  try {
    // Método mais direto usando fetch para APIs REST do Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    return { data: null, error };
  }
}

async function applyMigrations() {
  console.log('🚀 Iniciando aplicação de migrações...');
  
  try {
    // Ler todos os arquivos de migração
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 ${migrationFiles.length} arquivos de migração encontrados`);

    // Aplicar cada migração
    for (const file of migrationFiles) {
      console.log(`\n📄 Aplicando migração: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Dividir o SQL em comandos individuais
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i] + ';';
        console.log(`  ⚡ Executando comando ${i + 1}/${commands.length}`);
        
        const { error } = await runSQL(command);
        
        if (error) {
          console.error(`  ❌ Erro no comando ${i + 1}:`, error.message);
          // Continuar com os próximos comandos mesmo se houver erro
        } else {
          console.log(`  ✅ Comando ${i + 1} executado com sucesso`);
        }
      }
      
      console.log(`✅ Migração ${file} aplicada`);
    }

    console.log('\n🎉 Todas as migrações foram processadas!');
    console.log('📌 Nota: Alguns erros podem ser esperados se as tabelas/colunas já existem');
    
  } catch (error) {
    console.error('❌ Erro durante aplicação de migrações:', error);
    process.exit(1);
  }
}

// Executar migrações
applyMigrations();
```

### scripts/seed-database.js (parcial)
```javascript
const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rbqzddsserknaedojuex.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY não definida');
  console.log('Por favor, defina a variável de ambiente SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dados de exemplo
const sampleData = {
  categories: [
    {
      name: "Marketing Digital",
      description: "Cursos e produtos relacionados a marketing online",
      slug: "marketing-digital"
    },
    {
      name: "Desenvolvimento Pessoal",
      description: "Produtos para crescimento e desenvolvimento pessoal",
      slug: "desenvolvimento-pessoal"
    },
    {
      name: "Finanças",
      description: "Educação financeira e investimentos",
      slug: "financas"
    },
    {
      name: "Saúde e Bem-estar",
      description: "Produtos para saúde física e mental",
      slug: "saude-bem-estar"
    }
  ],
  
  products: [
    {
      name: "Curso Completo de Marketing Digital",
      short_description: "Método completo para criar um negócio online lucrativo do zero",
      description: "Descubra o método exato que já ajudou mais de 5.000 pessoas a criar negócios online lucrativos. Desde a escolha do nicho até a primeira venda.",
      price: 997.00,
      commission_rate: 30.00,
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
      sales_page_url: "https://example.com/marketing-digital",
      category_slug: "marketing-digital",
      is_active: true
    },
    // ... mais produtos
  ]
};

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...');
  
  try {
    // Inserir categorias
    console.log('\n📁 Inserindo categorias...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .insert(sampleData.categories)
      .select();
    
    if (catError) throw catError;
    console.log(`✅ ${categories.length} categorias inseridas`);
    
    // ... continua com produtos e outros dados
    
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    process.exit(1);
  }
}

// Executar seed
seedDatabase();
```

## 🗄️ MIGRAÇÕES SQL

### supabase/consolidated-migrations.sql (principais estruturas)
```sql
-- ========================================
-- PORTAL AFILIADOS DA ELITE
-- Migrações Consolidadas para Aplicação Manual
-- Projeto: rbqzddsserknaedojuex
-- ========================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para timestamps automáticos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enums do sistema
CREATE TYPE affiliate_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE event_type AS ENUM ('click', 'conversion', 'commission_earned', 'payment_sent');
CREATE TYPE payment_method AS ENUM ('pix', 'bank_transfer', 'paypal');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');

-- Expandir tabela profiles para afiliados
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_status affiliate_status DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0.00;

-- Gerar affiliate_id automático
CREATE OR REPLACE FUNCTION generate_affiliate_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.affiliate_id IS NULL THEN
        NEW.affiliate_id := 'AFF' || UPPER(substring(gen_random_uuid()::text, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

---

**Backup de código principal criado com sucesso!**

Para arquivos específicos adicionais, me informe quais você gostaria de incluir no backup. 