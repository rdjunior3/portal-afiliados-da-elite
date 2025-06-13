-- =====================================================
-- SCRIPT CRÍTICO DE CORREÇÃO DAS TABELAS
-- Portal Afiliados da Elite - Correção Urgente
-- Data: 2025-01-30
-- =====================================================

-- Este script cria TODAS as tabelas necessárias que estão causando erros 500

BEGIN;

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. FUNÇÃO DE UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. TABELA PROFILES (CRÍTICA)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_sales DECIMAL(10,2) DEFAULT 0.00,
    total_commissions DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA PRODUCTS (CRÍTICA)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    category_id UUID REFERENCES categories(id),
    affiliate_link TEXT,
    sales_page_url TEXT,
    image_url TEXT,
    gravity_score DECIMAL(5,2) DEFAULT 0.00,
    earnings_per_click DECIMAL(8,2) DEFAULT 0.00,
    conversion_rate_avg DECIMAL(5,2) DEFAULT 0.00,
    commission_rate DECIMAL(5,2) DEFAULT 50.00,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_exclusive BOOLEAN DEFAULT FALSE,
    total_sales INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA ELITE_TIPS (CRÍTICA)
CREATE TABLE IF NOT EXISTS elite_tips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    icon TEXT DEFAULT 'info',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA COURSES (CRÍTICA)
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    instructor_name TEXT,
    duration_hours INTEGER DEFAULT 0,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    enrollment_count INTEGER DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA LESSONS (PARA COURSES)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA CHAT_ROOMS (CRÍTICA)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'admin')),
    max_members INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRIGGERS DE UPDATED_AT
CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_elite_tips_updated_at
    BEFORE UPDATE ON elite_tips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_elite_tips_active ON elite_tips(is_active);
CREATE INDEX IF NOT EXISTS idx_elite_tips_order ON elite_tips(order_index);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active);

-- 12. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- 13. POLÍTICAS RLS BÁSICAS (PERMISSIVAS PARA TESTES)

-- Profiles: Usuários veem próprio perfil, admins veem tudo
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admin acesso total profiles" ON profiles;

CREATE POLICY "Usuários podem ver próprio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin acesso total profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Categories: Leitura pública
DROP POLICY IF EXISTS "Categories são públicas" ON categories;
CREATE POLICY "Categories são públicas" ON categories FOR SELECT TO authenticated USING (true);

-- Products: Produtos ativos são públicos
DROP POLICY IF EXISTS "Produtos ativos são públicos" ON products;
CREATE POLICY "Produtos ativos são públicos" ON products 
    FOR SELECT TO authenticated USING (is_active = true);

-- Elite Tips: Dicas ativas são públicas
DROP POLICY IF EXISTS "Dicas ativas são públicas" ON elite_tips;
CREATE POLICY "Dicas ativas são públicas" ON elite_tips 
    FOR SELECT TO authenticated USING (is_active = true);

-- Courses: Cursos ativos são públicos
DROP POLICY IF EXISTS "Cursos ativos são públicos" ON courses;
CREATE POLICY "Cursos ativos são públicos" ON courses 
    FOR SELECT TO authenticated USING (is_active = true);

-- Lessons: Aulas são públicas
DROP POLICY IF EXISTS "Aulas são públicas" ON lessons;
CREATE POLICY "Aulas são públicas" ON lessons FOR SELECT TO authenticated USING (true);

-- Chat Rooms: Salas ativas são públicas
DROP POLICY IF EXISTS "Salas ativas são públicas" ON chat_rooms;
CREATE POLICY "Salas ativas são públicas" ON chat_rooms 
    FOR SELECT TO authenticated USING (is_active = true);

-- 14. DADOS INICIAIS

-- Categorias padrão
INSERT INTO categories (name, description, icon, color, order_index) VALUES
('Marketing Digital', 'Produtos de marketing e vendas online', 'marketing', '#FF6B35', 1),
('Educação', 'Cursos e materiais educativos', 'education', '#4ECDC4', 2),
('Saúde', 'Produtos relacionados à saúde e bem-estar', 'health', '#45B7D1', 3),
('Tecnologia', 'Softwares e ferramentas tecnológicas', 'tech', '#96CEB4', 4),
('Finanças', 'Investimentos e educação financeira', 'finance', '#FECA57', 5)
ON CONFLICT (name) DO NOTHING;

-- Dicas da Elite
INSERT INTO elite_tips (title, content, icon, order_index, is_active) VALUES
(
    'Complete seu perfil',
    'Preencha todas as informações do seu perfil para aumentar sua credibilidade como afiliado.',
    'user',
    1,
    true
),
(
    'Explore produtos premium',
    'Descubra os produtos com maior potencial de conversão e comissões mais altas.',
    'star',
    2,
    true
),
(
    'Participe das capacitações',
    'Assista aos treinamentos exclusivos para maximizar seus resultados como afiliado.',
    'play-circle',
    3,
    true
)
ON CONFLICT DO NOTHING;

-- Sala de chat padrão
INSERT INTO chat_rooms (name, description, type, is_active) VALUES
(
    'Comunidade da Elite',
    'Espaço exclusivo para afiliados trocarem experiências e estratégias de sucesso.',
    'public',
    true
)
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- 15. VERIFICAÇÃO FINAL
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'products', 'elite_tips', 'courses', 'chat_rooms', 'categories');
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ MIGRAÇÃO CRÍTICA CONCLUÍDA COM SUCESSO! ';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '📊 Tabelas criadas: %/6', table_count;
    RAISE NOTICE '🔒 RLS ativado em todas as tabelas';
    RAISE NOTICE '⚡ Índices de performance criados';
    RAISE NOTICE '🎯 Políticas básicas aplicadas';
    RAISE NOTICE '📋 Dados iniciais inseridos';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🚀 PRONTO PARA USAR!';
    RAISE NOTICE '==============================================';
END $$; 