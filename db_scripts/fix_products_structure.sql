-- ================================================================
-- MIGRAÇÃO: ESTRUTURA COMPLETA DA TABELA PRODUCTS
-- Portal Afiliados da Elite - Sincronização Frontend → Backend
-- Data: 06/01/2025
-- Objetivo: Garantir que todos os campos necessários existam
-- ================================================================

-- ============================================
-- 1. VERIFICAR ESTRUTURA ATUAL
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
        RAISE NOTICE '❌ Tabela products NÃO existe - será criada';
    END IF;
END $$;

-- ============================================
-- 2. CRIAR ENUM SE NECESSÁRIO
-- ============================================

-- Criar enum product_status se não existir
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
-- 3. ADICIONAR COLUNAS AUSENTES
-- ============================================

-- Função helper para verificar se coluna existe
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Adicionar colunas se não existirem
DO $$
BEGIN
    -- currency
    IF NOT column_exists('products', 'currency') THEN
        ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'BRL';
        RAISE NOTICE '✅ Coluna currency adicionada';
    END IF;

    -- commission_amount
    IF NOT column_exists('products', 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna commission_amount adicionada';
    END IF;

    -- requires_approval
    IF NOT column_exists('products', 'requires_approval') THEN
        ALTER TABLE products ADD COLUMN requires_approval BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna requires_approval adicionada';
    END IF;

    -- min_payout
    IF NOT column_exists('products', 'min_payout') THEN
        ALTER TABLE products ADD COLUMN min_payout DECIMAL(10,2) DEFAULT 50;
        RAISE NOTICE '✅ Coluna min_payout adicionada';
    END IF;

    -- sales_page_url
    IF NOT column_exists('products', 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE '✅ Coluna sales_page_url adicionada';
    END IF;

    -- is_featured
    IF NOT column_exists('products', 'is_featured') THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_featured adicionada';
    END IF;

    -- is_exclusive
    IF NOT column_exists('products', 'is_exclusive') THEN
        ALTER TABLE products ADD COLUMN is_exclusive BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_exclusive adicionada';
    END IF;

    -- gravity_score
    IF NOT column_exists('products', 'gravity_score') THEN
        ALTER TABLE products ADD COLUMN gravity_score INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna gravity_score adicionada';
    END IF;

    -- earnings_per_click
    IF NOT column_exists('products', 'earnings_per_click') THEN
        ALTER TABLE products ADD COLUMN earnings_per_click DECIMAL(10,4) DEFAULT 0;
        RAISE NOTICE '✅ Coluna earnings_per_click adicionada';
    END IF;

    -- conversion_rate_avg
    IF NOT column_exists('products', 'conversion_rate_avg') THEN
        ALTER TABLE products ADD COLUMN conversion_rate_avg DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna conversion_rate_avg adicionada';
    END IF;

    -- refund_rate
    IF NOT column_exists('products', 'refund_rate') THEN
        ALTER TABLE products ADD COLUMN refund_rate DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna refund_rate adicionada';
    END IF;

    -- slug (importante para URLs)
    IF NOT column_exists('products', 'slug') THEN
        ALTER TABLE products ADD COLUMN slug TEXT;
        RAISE NOTICE '✅ Coluna slug adicionada';
    END IF;

    -- thumbnail_url (para imagens)
    IF NOT column_exists('products', 'thumbnail_url') THEN
        ALTER TABLE products ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE '✅ Coluna thumbnail_url adicionada';
    END IF;
END $$;

-- ============================================
-- 4. CORRIGIR TIPOS DE DADOS
-- ============================================

-- Garantir que status usa o enum
DO $$
BEGIN
    -- Verificar se a coluna status existe e não é enum
    IF column_exists('products', 'status') THEN
        -- Tentar alterar para enum
        BEGIN
            ALTER TABLE products 
            ALTER COLUMN status TYPE product_status 
            USING status::product_status;
            RAISE NOTICE '✅ Coluna status convertida para enum';
        EXCEPTION WHEN others THEN
            RAISE NOTICE '⚠️ Não foi possível converter status para enum: %', SQLERRM;
        END;
    END IF;
END $$;

-- ============================================
-- 5. POPULAR CAMPOS OBRIGATÓRIOS
-- ============================================

-- Gerar slugs para produtos existentes sem slug
UPDATE products 
SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            UNACCENT(name), 
            '[^a-zA-Z0-9\s]', '', 'g'
        ), 
        '\s+', '-', 'g'
    )
)
WHERE slug IS NULL OR slug = '';

-- Garantir unicidade dos slugs
UPDATE products 
SET slug = slug || '-' || SUBSTRING(id::text, 1, 8)
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
        FROM products
        WHERE slug IS NOT NULL
    ) t WHERE rn > 1
);

-- ============================================
-- 6. ADICIONAR CONSTRAINTS E ÍNDICES
-- ============================================

-- Constraint de slug único
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_slug_unique'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);
        RAISE NOTICE '✅ Constraint slug único adicionado';
    END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_exclusive ON products(is_exclusive);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);

-- ============================================
-- 7. CONFIGURAR RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política básica para admins
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Política para leitura pública
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
FOR SELECT TO public
USING (status = 'active');

-- ============================================
-- 8. CONFIGURAR STORAGE BUCKETS
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

-- Políticas de storage para product-images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can manage product images" ON storage.objects;
CREATE POLICY "Admins can manage product images" ON storage.objects
FOR ALL TO authenticated
USING (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- ============================================
-- 9. VERIFICAÇÃO FINAL
-- ============================================

-- Mostrar estrutura final da tabela
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== ESTRUTURA FINAL DA TABELA PRODUCTS ===';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'products' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '% | % | % | %', rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
    END LOOP;
END $$;

-- Limpar função helper
DROP FUNCTION IF EXISTS column_exists(text, text);

-- ============================================
-- 10. SUCESSO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '✅ Estrutura da tabela products atualizada';
    RAISE NOTICE '✅ Políticas RLS configuradas';
    RAISE NOTICE '✅ Storage buckets configurados';
    RAISE NOTICE '✅ Índices adicionados para performance';
END $$; 