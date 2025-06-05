-- ================================================================
-- SCRIPT DE DIAGNÓSTICO E CORREÇÃO DA TABELA PRODUCTS
-- Portal Afiliados da Elite - Debug dos problemas de CRUD
-- Data: 04/06/2025
-- ================================================================

-- ============================================
-- 1. DIAGNÓSTICO DA ESTRUTURA ATUAL
-- ============================================

-- Verificar se a tabela products existe
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
    ) THEN
        RAISE NOTICE '✅ Tabela products existe';
    ELSE
        RAISE NOTICE '❌ Tabela products NÃO existe';
    END IF;
END $$;

-- Verificar estrutura da tabela products
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass;

-- ============================================
-- 2. VERIFICAR ENUM product_status
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        RAISE NOTICE '✅ Enum product_status existe';
        
        -- Mostrar valores do enum
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_status')
        ORDER BY enumsortorder;
    ELSE
        RAISE NOTICE '❌ Enum product_status NÃO existe - será criado';
        
        -- Criar enum se não existir
        CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');
        RAISE NOTICE '✅ Enum product_status criado';
    END IF;
END $$;

-- ============================================
-- 3. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA
-- ============================================

-- Verificar se sales_page_url existe
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'sales_page_url'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Coluna sales_page_url existe';
    ELSE
        RAISE NOTICE '❌ Coluna sales_page_url NÃO existe - será adicionada';
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE '✅ Coluna sales_page_url adicionada';
    END IF;
END $$;

-- Verificar se colunas obrigatórias existem
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col TEXT;
    required_columns TEXT[] := ARRAY['name', 'slug', 'affiliate_link', 'price', 'commission_rate', 'status'];
BEGIN
    FOREACH col IN ARRAY required_columns LOOP
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'products' 
            AND column_name = col
            AND table_schema = 'public'
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE '❌ Colunas obrigatórias ausentes: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✅ Todas as colunas obrigatórias existem';
    END IF;
END $$;

-- ============================================
-- 4. VERIFICAR POLÍTICAS RLS
-- ============================================

-- Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado'
        ELSE '⚠️ RLS Desabilitado'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'products' 
AND schemaname = 'public';

-- Listar políticas existentes
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products' 
AND schemaname = 'public';

-- ============================================
-- 5. VERIFICAR PERMISSÕES ADMIN
-- ============================================

-- Verificar se existem usuários admin
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM profiles 
    WHERE role = 'admin' OR is_admin = true;
    
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ Encontrados % usuários admin', admin_count;
    ELSE
        RAISE NOTICE '❌ Nenhum usuário admin encontrado';
    END IF;
END $$;

-- ============================================
-- 6. CORRIGIR PROBLEMAS ENCONTRADOS
-- ============================================

-- Garantir que a tabela products tenha a estrutura correta
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    affiliate_link TEXT NOT NULL,
    sales_page_url TEXT,
    gravity_score INTEGER DEFAULT 0,
    earnings_per_click DECIMAL(10,4) DEFAULT 0,
    conversion_rate_avg DECIMAL(5,2) DEFAULT 0,
    refund_rate DECIMAL(5,2) DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_exclusive BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    min_payout DECIMAL(10,2) DEFAULT 0,
    status product_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que as políticas RLS existam
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

-- Habilitar RLS na tabela products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CORRIGIR PROBLEMAS DE STORAGE
-- ============================================

-- Criar bucket para produtos se não existir
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

-- Criar bucket alternativo 'products'
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

-- Políticas de storage para produtos
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

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('products', 'product-images'));

-- ============================================
-- 8. TESTES FINAIS
-- ============================================

-- Testar inserção de produto
DO $$
DECLARE
    test_product_id UUID;
BEGIN
    -- Tentar inserir um produto de teste
    INSERT INTO products (
        name,
        slug,
        description,
        price,
        commission_rate,
        affiliate_link,
        status
    ) VALUES (
        'Produto Teste Debug',
        'produto-teste-debug',
        'Produto para testar a funcionalidade',
        99.90,
        20.00,
        'https://exemplo.com/afiliado',
        'active'
    ) RETURNING id INTO test_product_id;
    
    RAISE NOTICE '✅ Produto de teste inserido com sucesso: %', test_product_id;
    
    -- Remover o produto de teste
    DELETE FROM products WHERE id = test_product_id;
    RAISE NOTICE '✅ Produto de teste removido com sucesso';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao testar inserção: %', SQLERRM;
END $$;

-- Verificar índices existentes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'products' 
AND schemaname = 'public';

-- ============================================
-- 9. RELATÓRIO FINAL
-- ============================================

DO $$
DECLARE
    product_count INTEGER;
    category_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin' OR is_admin = true;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE '        RELATÓRIO DE DIAGNÓSTICO        ';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '📊 Produtos cadastrados: %', product_count;
    RAISE NOTICE '📂 Categorias disponíveis: %', category_count;
    RAISE NOTICE '👤 Usuários admin: %', admin_count;
    RAISE NOTICE '==========================================';
    
    IF product_count = 0 THEN
        RAISE NOTICE '⚠️ AVISO: Nenhum produto cadastrado';
    END IF;
    
    IF admin_count = 0 THEN
        RAISE NOTICE '❌ PROBLEMA: Nenhum usuário admin encontrado';
    END IF;
END $$;

-- Mensagem final
SELECT '🎉 Script de diagnóstico e correção executado com sucesso!' as resultado; 