-- =============================================
-- SOLUÇÃO URGENTE PARA PROJETO SUPABASE NOVO
-- Resolve erros 406/403 e cadastro de produtos
-- =============================================

-- 1. VERIFICAR SE É PROJETO NOVO
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles';
    
    IF table_count = 0 THEN
        RAISE NOTICE '🚨 PROJETO NOVO DETECTADO - Aplicando estrutura completa...';
    ELSE
        RAISE NOTICE '✅ Estrutura existente detectada';
    END IF;
END $$;

-- 2. INSTALAR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 3. CRIAR ENUMS
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('affiliate', 'admin');
CREATE TYPE IF NOT EXISTS affiliate_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE IF NOT EXISTS product_status AS ENUM ('active', 'inactive', 'pending', 'archived');

-- 4. CRIAR TABELA PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role user_role DEFAULT 'affiliate',
    affiliate_status affiliate_status DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRIAR TABELA CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CRIAR TABELA PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sales_page_url TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    status product_status DEFAULT 'active',
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CRIAR TABELA CHAT_ROOMS (RESOLVE ERRO 406/403)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CRIAR TABELA MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. HABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 10. POLÍTICAS PERMISSIVAS (TEMPORÁRIAS)
-- Chat rooms - RESOLVER ERRO 403
CREATE POLICY "chat_rooms_select_all" ON chat_rooms
    FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY "chat_rooms_insert_admin" ON chat_rooms
    FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Categories - públicas
CREATE POLICY "categories_select_all" ON categories
    FOR SELECT USING (is_active = TRUE);

-- Products - públicos  
CREATE POLICY "products_select_all" ON products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "products_insert_admin" ON products
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Messages
CREATE POLICY "messages_select_all" ON messages
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "messages_insert_all" ON messages
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- 11. DADOS INICIAIS
INSERT INTO categories (name, slug, description) VALUES
('Marketing Digital', 'marketing-digital', 'Produtos de marketing digital'),
('Educação', 'educacao', 'Cursos e materiais educacionais'),
('Tecnologia', 'tecnologia', 'Software e ferramentas')
ON CONFLICT (slug) DO NOTHING;

-- CRIAR SALA "COMUNIDADE DA ELITE" (RESOLVE LOOP INFINITO)
INSERT INTO chat_rooms (name, description, is_active) VALUES
('Comunidade da Elite', 'Sala oficial da comunidade de afiliados elite.', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 12. TRIGGER PARA CRIAR PERFIL
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role, affiliate_status)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN NEW.email = '04junior.silva09@gmail.com' THEN 'admin'::user_role ELSE 'affiliate'::user_role END,
        'approved'::affiliate_status
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 13. CONFIGURAR BUCKETS STORAGE (RESOLVE UPLOAD PRODUTOS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    TRUE,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas storage PERMISSIVAS
CREATE POLICY "product_images_select_all" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert_auth" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_update_auth" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images');

-- 14. VERIFICAÇÃO FINAL
DO $$
DECLARE
    tables_created INTEGER;
    chat_room_exists INTEGER;
    bucket_exists INTEGER;
    admin_exists INTEGER;
BEGIN
    -- Contar tabelas
    SELECT COUNT(*) INTO tables_created
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'chat_rooms', 'products', 'categories');
    
    -- Verificar sala
    SELECT COUNT(*) INTO chat_room_exists
    FROM chat_rooms WHERE name = 'Comunidade da Elite';
    
    -- Verificar bucket
    SELECT COUNT(*) INTO bucket_exists
    FROM storage.buckets WHERE id = 'product-images';
    
    -- Verificar admin
    SELECT COUNT(*) INTO admin_exists
    FROM profiles WHERE role = 'admin';
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'CORREÇÃO URGENTE APLICADA!';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Tabelas criadas: %/4', tables_created;
    RAISE NOTICE 'Sala "Comunidade da Elite": % (resolve erro 406/403)', chat_room_exists;
    RAISE NOTICE 'Bucket product-images: % (resolve upload)', bucket_exists;
    RAISE NOTICE 'Usuários admin: %', admin_exists;
    RAISE NOTICE '====================================';
    
    IF tables_created >= 4 AND chat_room_exists > 0 AND bucket_exists > 0 THEN
        RAISE NOTICE '✅ TUDO CONFIGURADO! Teste agora:';
        RAISE NOTICE '1. Refresh da página';
        RAISE NOTICE '2. Teste cadastro de produto';
        RAISE NOTICE '3. Chat deve funcionar';
    ELSE
        RAISE NOTICE '⚠️ Alguns itens podem precisar de ajuste manual';
    END IF;
END $$; 