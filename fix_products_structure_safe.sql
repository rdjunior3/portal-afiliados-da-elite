-- ================================================================
-- MIGRAÇÃO SEGURA: ESTRUTURA DA TABELA PRODUCTS
-- Portal Afiliados da Elite - Versão Simplificada e Segura
-- Data: 06/01/2025
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
        RAISE NOTICE '❌ Tabela products não existe - criando estrutura básica';
        
        -- Criar tabela básica se não existir
        CREATE TABLE products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10,
            affiliate_link TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- ============================================
-- 2. CRIAR ENUM SE NECESSÁRIO
-- ============================================

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
CREATE OR REPLACE FUNCTION column_exists_temp(table_name text, column_name text)
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

-- Adicionar colunas uma por vez com tratamento de erro
DO $$
BEGIN
    -- currency
    IF NOT column_exists_temp('products', 'currency') THEN
        ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'BRL';
        RAISE NOTICE '✅ Coluna currency adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna currency já existe';
    END IF;

    -- commission_amount
    IF NOT column_exists_temp('products', 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna commission_amount adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna commission_amount já existe';
    END IF;

    -- requires_approval
    IF NOT column_exists_temp('products', 'requires_approval') THEN
        ALTER TABLE products ADD COLUMN requires_approval BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna requires_approval adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna requires_approval já existe';
    END IF;

    -- min_payout
    IF NOT column_exists_temp('products', 'min_payout') THEN
        ALTER TABLE products ADD COLUMN min_payout DECIMAL(10,2) DEFAULT 50;
        RAISE NOTICE '✅ Coluna min_payout adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna min_payout já existe';
    END IF;

    -- sales_page_url
    IF NOT column_exists_temp('products', 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE '✅ Coluna sales_page_url adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna sales_page_url já existe';
    END IF;

    -- is_featured
    IF NOT column_exists_temp('products', 'is_featured') THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_featured adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna is_featured já existe';
    END IF;

    -- is_exclusive
    IF NOT column_exists_temp('products', 'is_exclusive') THEN
        ALTER TABLE products ADD COLUMN is_exclusive BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_exclusive adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna is_exclusive já existe';
    END IF;

    -- gravity_score
    IF NOT column_exists_temp('products', 'gravity_score') THEN
        ALTER TABLE products ADD COLUMN gravity_score INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna gravity_score adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna gravity_score já existe';
    END IF;

    -- earnings_per_click
    IF NOT column_exists_temp('products', 'earnings_per_click') THEN
        ALTER TABLE products ADD COLUMN earnings_per_click DECIMAL(10,4) DEFAULT 0;
        RAISE NOTICE '✅ Coluna earnings_per_click adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna earnings_per_click já existe';
    END IF;

    -- conversion_rate_avg
    IF NOT column_exists_temp('products', 'conversion_rate_avg') THEN
        ALTER TABLE products ADD COLUMN conversion_rate_avg DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna conversion_rate_avg adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna conversion_rate_avg já existe';
    END IF;

    -- refund_rate
    IF NOT column_exists_temp('products', 'refund_rate') THEN
        ALTER TABLE products ADD COLUMN refund_rate DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE '✅ Coluna refund_rate adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna refund_rate já existe';
    END IF;

    -- slug
    IF NOT column_exists_temp('products', 'slug') THEN
        ALTER TABLE products ADD COLUMN slug TEXT;
        RAISE NOTICE '✅ Coluna slug adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna slug já existe';
    END IF;

    -- thumbnail_url
    IF NOT column_exists_temp('products', 'thumbnail_url') THEN
        ALTER TABLE products ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE '✅ Coluna thumbnail_url adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna thumbnail_url já existe';
    END IF;

    -- status (se não existir)
    IF NOT column_exists_temp('products', 'status') THEN
        ALTER TABLE products ADD COLUMN status product_status DEFAULT 'active';
        RAISE NOTICE '✅ Coluna status adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna status já existe';
    END IF;

    -- category_id (se não existir)
    IF NOT column_exists_temp('products', 'category_id') THEN
        ALTER TABLE products ADD COLUMN category_id UUID;
        RAISE NOTICE '✅ Coluna category_id adicionada';
    ELSE
        RAISE NOTICE '⚪ Coluna category_id já existe';
    END IF;

EXCEPTION WHEN others THEN
    RAISE NOTICE '⚠️ Erro ao adicionar colunas: %', SQLERRM;
END $$;

-- ============================================
-- 4. POPULAR CAMPOS OBRIGATÓRIOS
-- ============================================

-- Gerar slugs para produtos sem slug
UPDATE products 
SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), 
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
        WHERE slug IS NOT NULL AND slug != ''
    ) t WHERE rn > 1
);

-- ============================================
-- 5. CONFIGURAR ÍNDICES BÁSICOS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- ============================================
-- 6. CONFIGURAR RLS BÁSICO
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
        AND (profiles.role IN ('admin', 'super_admin') OR profiles.is_admin = true)
    )
);

-- Política para leitura pública
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
FOR SELECT TO public
USING (status = 'active');

-- ============================================
-- 7. CONFIGURAR STORAGE BUCKET BÁSICO
-- ============================================

-- Criar bucket product-images se não existir
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

-- ============================================
-- 8. VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
    rec RECORD;
    count_products INTEGER;
BEGIN
    -- Contar produtos
    SELECT COUNT(*) INTO count_products FROM products;
    
    RAISE NOTICE '=== RESUMO DA MIGRAÇÃO ===';
    RAISE NOTICE '✅ Produtos existentes: %', count_products;
    
    RAISE NOTICE '=== COLUNAS DA TABELA PRODUCTS ===';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'products' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '% | % | %', rec.column_name, rec.data_type, rec.is_nullable;
    END LOOP;
END $$;

-- Limpar função helper
DROP FUNCTION IF EXISTS column_exists_temp(text, text);

-- ============================================
-- 9. SUCESSO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 MIGRAÇÃO SEGURA CONCLUÍDA!';
    RAISE NOTICE '✅ Estrutura da tabela products atualizada';
    RAISE NOTICE '✅ Índices adicionados';
    RAISE NOTICE '✅ RLS configurado';
    RAISE NOTICE '✅ Storage bucket criado';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Teste o cadastro de produtos no admin';
    RAISE NOTICE '2. Verifique upload de imagens';
    RAISE NOTICE '3. Configure políticas de storage se necessário';
    RAISE NOTICE '';
END $$; 