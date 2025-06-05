-- ================================================================
-- MIGRAÇÃO COMPLETA - ESTRUTURA SUPABASE ATUALIZADA
-- Portal Afiliados da Elite - Aplicar mudanças do código
-- Data: 06/01/2025
-- ================================================================

-- ============================================
-- 1. VERIFICAR E CRIAR ENUM product_status
-- ============================================

-- Criar enum se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');
        RAISE NOTICE '✅ Enum product_status criado';
    ELSE
        RAISE NOTICE '✅ Enum product_status já existe';
    END IF;
END $$;

-- ============================================
-- 2. ATUALIZAR TABELA PRODUCTS
-- ============================================

-- Adicionar coluna sales_page_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'sales_page_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE '✅ Coluna sales_page_url adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna sales_page_url já existe';
    END IF;
END $$;

-- Garantir que todas as colunas necessárias existam
-- (Baseado na interface Product do ManageProducts.tsx)
DO $$
BEGIN
    -- Verificar e adicionar colunas se necessário
    
    -- gravity_score
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'gravity_score'
    ) THEN
        ALTER TABLE products ADD COLUMN gravity_score INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna gravity_score adicionada';
    END IF;
    
    -- earnings_per_click
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'earnings_per_click'
    ) THEN
        ALTER TABLE products ADD COLUMN earnings_per_click DECIMAL(10,4) DEFAULT 0;
        RAISE NOTICE '✅ Coluna earnings_per_click adicionada';
    END IF;
    
    -- conversion_rate_avg
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'conversion_rate_avg'
    ) THEN
        ALTER TABLE products ADD COLUMN conversion_rate_avg DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna conversion_rate_avg adicionada';
    END IF;
    
    -- refund_rate
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'refund_rate'
    ) THEN
        ALTER TABLE products ADD COLUMN refund_rate DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna refund_rate adicionada';
    END IF;
    
    -- is_featured
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_featured adicionada';
    END IF;
    
    -- is_exclusive
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_exclusive'
    ) THEN
        ALTER TABLE products ADD COLUMN is_exclusive BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_exclusive adicionada';
    END IF;

END $$;

-- Alterar tipo da coluna status para usar o enum (se necessário)
DO $$
BEGIN
    -- Verificar se a coluna status já usa o enum
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'status'
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- Alterar coluna para usar enum
        ALTER TABLE products 
        ALTER COLUMN status TYPE product_status 
        USING status::product_status;
        RAISE NOTICE '✅ Coluna status convertida para enum';
    ELSE
        RAISE NOTICE '✅ Coluna status já usa enum';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Não foi possível converter status para enum: %', SQLERRM;
END $$;

-- ============================================
-- 3. ATUALIZAR TABELA PROFILES (AVATAR)
-- ============================================

-- Adicionar coluna avatar_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '✅ Coluna avatar_url adicionada ao profiles';
    ELSE
        RAISE NOTICE '✅ Coluna avatar_url já existe no profiles';
    END IF;
END $$;

-- ============================================
-- 4. CONFIGURAR STORAGE BUCKETS
-- ============================================

-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'product-images', 
    'product-images', 
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket alternativo 'products'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'products', 
    'products', 
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'avatars', 
    'avatars', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket profiles para compatibilidade
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'profiles', 
    'profiles', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 5. CONFIGURAR POLÍTICAS RLS - PRODUCTS
-- ============================================

-- Habilitar RLS na tabela products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem produtos
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

-- Política para leitura pública de produtos ativos
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
FOR SELECT TO public
USING (status = 'active');

-- Política para afiliados verem produtos aprovados
DROP POLICY IF EXISTS "Affiliates can view approved products" ON products;
CREATE POLICY "Affiliates can view approved products" ON products
FOR SELECT TO authenticated
USING (
    status IN ('active', 'pending') OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

-- ============================================
-- 6. CONFIGURAR POLÍTICAS RLS - STORAGE
-- ============================================

-- Políticas para bucket de produtos
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id IN ('products', 'product-images') AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id IN ('products', 'product-images') AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id IN ('products', 'product-images') AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('products', 'product-images'));

-- Políticas para bucket de avatares
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('avatars', 'profiles'));

DROP POLICY IF EXISTS "Users can update their avatars" ON storage.objects;
CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id IN ('avatars', 'profiles') AND
    (storage.foldername(name))[1] = 'profiles'
);

DROP POLICY IF EXISTS "Users can delete their avatars" ON storage.objects;
CREATE POLICY "Users can delete their avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id IN ('avatars', 'profiles') AND
    (storage.foldername(name))[1] = 'profiles'
);

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('avatars', 'profiles'));

-- ============================================
-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para tabela products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_exclusive ON products(is_exclusive);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));

-- Índices para tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_id ON profiles(affiliate_id);

-- ============================================
-- 8. TRIGGERS PARA updated_at
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. VALIDAÇÕES E CONSTRAINTS
-- ============================================

-- Constraint para validar URLs
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_affiliate_link;
ALTER TABLE products ADD CONSTRAINT valid_affiliate_link 
CHECK (affiliate_link ~ '^https?://.*');

-- Constraint para validar sales_page_url
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_sales_page_url;
ALTER TABLE products ADD CONSTRAINT valid_sales_page_url 
CHECK (sales_page_url IS NULL OR sales_page_url ~ '^https?://.*');

-- Constraint para validar avatar_url
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_avatar_url;
ALTER TABLE profiles ADD CONSTRAINT valid_avatar_url 
CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://.*');

-- Constraint para validar preços
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_price;
ALTER TABLE products ADD CONSTRAINT valid_price 
CHECK (price >= 0);

-- Constraint para validar commission_rate
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_commission_rate;
ALTER TABLE products ADD CONSTRAINT valid_commission_rate 
CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- ============================================
-- 10. DADOS PADRÃO E CATEGORIAS
-- ============================================

-- Inserir categorias padrão se não existirem
INSERT INTO categories (name, slug, description, color) VALUES
('Marketing Digital', 'marketing-digital', 'Cursos e ferramentas de marketing digital', '#4ade80'),
('Negócios Online', 'negocios-online', 'Oportunidades de negócios na internet', '#3b82f6'),
('Educação', 'educacao', 'Cursos e treinamentos educacionais', '#f59e0b'),
('Saúde e Bem-estar', 'saude-bem-estar', 'Produtos de saúde e qualidade de vida', '#ef4444'),
('Finanças', 'financas', 'Investimentos e educação financeira', '#10b981'),
('Tecnologia', 'tecnologia', 'Software e ferramentas digitais', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 11. VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar estrutura final da tabela products
DO $$
DECLARE
    rec RECORD;
    products_count INTEGER;
    categories_count INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO categories_count FROM categories;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE '    MIGRAÇÃO CONCLUÍDA COM SUCESSO     ';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '📊 Produtos: %', products_count;
    RAISE NOTICE '📂 Categorias: %', categories_count;
    RAISE NOTICE '==========================================';
    
    -- Verificar colunas essenciais
    RAISE NOTICE '✅ Verificando estrutura da tabela products:';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND table_schema = 'public'
        AND column_name IN ('sales_page_url', 'gravity_score', 'earnings_per_click', 'conversion_rate_avg', 'is_featured', 'is_exclusive')
        ORDER BY column_name
    LOOP
        RAISE NOTICE '   • %: % (%)', rec.column_name, rec.data_type, 
            CASE WHEN rec.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END;
    END LOOP;
    
END $$;

-- Mensagem final
SELECT '🎉 Estrutura do Supabase atualizada com sucesso!' as resultado,
       NOW() as executado_em; 