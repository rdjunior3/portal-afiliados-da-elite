-- =============================================
-- CORREÇÃO URGENTE PROJETO SUPABASE NOVO
-- Execute APÓS diagnostico_projeto_novo.sql
-- =============================================

BEGIN;

-- 1. INSTALAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CRIAR ENUMS BÁSICOS
DO $$
BEGIN
    -- User roles
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('affiliate', 'admin');
    END IF;
    
    -- Affiliate status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_status') THEN
        CREATE TYPE affiliate_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
    END IF;
    
    -- Product status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');
    END IF;
    
    -- Commission status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_status') THEN
        CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled', 'disputed');
    END IF;
END $$;

-- 3. CRIAR TABELA PROFILES (FUNDAMENTAL)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
            THEN first_name || ' ' || last_name
            WHEN first_name IS NOT NULL 
            THEN first_name
            ELSE email
        END
    ) STORED,
    avatar_url TEXT,
    phone TEXT,
    role user_role DEFAULT 'affiliate',
    affiliate_status affiliate_status DEFAULT 'pending',
    affiliate_id TEXT UNIQUE,
    affiliate_code TEXT UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_clicks > 0 
            THEN (total_conversions::DECIMAL / total_clicks::DECIMAL) * 100
            ELSE 0
        END
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRIAR TABELA CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRIAR TABELA PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    image_url TEXT,
    sales_page_url TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    status product_status DEFAULT 'active',
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CRIAR TABELA CHAT_ROOMS (RESOLVE ERRO 406/403)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CRIAR TABELA MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FUNÇÃO PARA ATUALIZAR TIMESTAMPS
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGERS PARA UPDATED_AT
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER chat_rooms_updated_at 
    BEFORE UPDATE ON chat_rooms 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 10. HABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 11. POLÍTICAS RLS BÁSICAS

-- Profiles: usuários veem seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories: públicas para leitura
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = TRUE);

-- Products: públicos para leitura se ativos
CREATE POLICY "Active products are viewable by everyone" ON products
    FOR SELECT USING (is_active = TRUE);

-- Chat rooms: afiliados aprovados podem ver salas ativas
CREATE POLICY "Approved affiliates can view active chat rooms" ON chat_rooms
    FOR SELECT USING (
        is_active = TRUE AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.affiliate_status = 'approved'
        )
    );

-- Messages: usuários autenticados podem ver mensagens de salas que têm acesso
CREATE POLICY "Users can view messages in accessible rooms" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = messages.room_id 
            AND chat_rooms.is_active = TRUE
        )
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.affiliate_status = 'approved'
        )
    );

-- 12. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, affiliate_id, affiliate_code)
    VALUES (
        NEW.id,
        NEW.email,
        'AFF' || UPPER(SUBSTRING(MD5(NEW.id::TEXT), 1, 8)),
        'CODE' || UPPER(SUBSTRING(MD5(NEW.id::TEXT), 1, 6))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 13. DADOS INICIAIS BÁSICOS

-- Categorias padrão
INSERT INTO categories (name, slug, description, color, sort_order) VALUES
('Marketing Digital', 'marketing-digital', 'Produtos de marketing digital', '#f59e0b', 1),
('Educação', 'educacao', 'Cursos e materiais educacionais', '#3b82f6', 2),
('Tecnologia', 'tecnologia', 'Software e ferramentas', '#8b5cf6', 3)
ON CONFLICT (slug) DO NOTHING;

-- Sala "Comunidade da Elite" (RESOLVE LOOP INFINITO)
INSERT INTO chat_rooms (name, description, is_active) VALUES
('Comunidade da Elite', 'Sala oficial da comunidade de afiliados elite. Networking premium e discussões estratégicas.', TRUE)
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- 14. VERIFICAÇÃO FINAL
DO $$
DECLARE
    tables_count INTEGER;
    chat_room_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tables_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'products', 'categories', 'chat_rooms', 'messages');
    
    SELECT COUNT(*) INTO chat_room_count 
    FROM chat_rooms 
    WHERE name = 'Comunidade da Elite';
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'CORREÇÃO APLICADA COM SUCESSO!';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Tabelas criadas: %/5', tables_count;
    RAISE NOTICE 'Sala "Comunidade da Elite": %', chat_room_count;
    RAISE NOTICE '====================================';
    
    IF tables_count = 5 AND chat_room_count = 1 THEN
        RAISE NOTICE '✅ ESTRUTURA BÁSICA OK - Aplicar buckets storage';
        RAISE NOTICE 'PRÓXIMO PASSO: Configurar buckets no Storage';
    ELSE
        RAISE NOTICE '⚠️ Verificar se todas as tabelas foram criadas';
    END IF;
END $$; 