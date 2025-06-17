-- ================================================================
-- SCRIPT CORRIGIDO - SEM REFERENCIAS A COLUNAS INEXISTENTES
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. LIMPEZA DE POLITICAS EXISTENTES
DO $$
BEGIN
    RAISE NOTICE 'Removendo politicas conflitantes...';
    
    -- Remover politicas storage
    DROP POLICY IF EXISTS "product_images_public_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_auth_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_auth_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
    
    -- Remover politicas products
    DROP POLICY IF EXISTS "products_admin_insert" ON products;
    DROP POLICY IF EXISTS "products_admin_update" ON products;
    DROP POLICY IF EXISTS "products_admin_delete" ON products;
    DROP POLICY IF EXISTS "products_public_select" ON products;
    
    RAISE NOTICE 'Politicas removidas!';
END $$;

-- 2. RECRIAR BUCKET
DO $$ 
BEGIN
    RAISE NOTICE 'Recriando bucket product-images...';
    
    -- Remover bucket e objetos
    DELETE FROM storage.objects WHERE bucket_id = 'product-images';
    DELETE FROM storage.buckets WHERE id = 'product-images';
    
    -- Criar bucket novo
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'product-images',
        'product-images', 
        true,
        52428800, -- 50MB
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
    );
    
    RAISE NOTICE 'Bucket criado!';
END $$;

-- 3. ADICIONAR CAMPOS NA TABELA PRODUCTS (SE NAO EXISTIREM)
DO $$
BEGIN
    RAISE NOTICE 'Verificando campos da tabela products...';
    
    -- Campo image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Campo image_url adicionado';
    END IF;
    
    -- Campo sales_page_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE 'Campo sales_page_url adicionado';
    END IF;
    
    -- Campo commission_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Campo commission_amount adicionado';
    END IF;
    
    -- Campo total_sales
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'total_sales') THEN
        ALTER TABLE products ADD COLUMN total_sales INTEGER DEFAULT 0;
        RAISE NOTICE 'Campo total_sales adicionado';
    END IF;
    
    -- Campo status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Campo status adicionado';
    END IF;
    
    RAISE NOTICE 'Estrutura verificada!';
END $$;

-- 4. MIGRAR DADOS APENAS SE AS COLUNAS EXISTIREM
DO $$
BEGIN
    RAISE NOTICE 'Migrando dados existentes...';
    
    -- Migrar de thumbnail_url (SE EXISTIR)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail_url') THEN
        UPDATE products 
        SET image_url = COALESCE(image_url, thumbnail_url)
        WHERE image_url IS NULL;
        RAISE NOTICE 'Migrado thumbnail_url para image_url';
    END IF;
    
    RAISE NOTICE 'Migracao concluida!';
END $$;

-- 5. CRIAR TABELA PRODUCT_OFFERS
CREATE TABLE IF NOT EXISTS product_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    promotion_url TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POLITICAS STORAGE PERMISSIVAS
CREATE POLICY "product_images_public_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

CREATE POLICY "product_images_auth_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_auth_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'product-images' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- 7. POLITICAS TABELAS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_select" ON products
FOR SELECT TO public
USING (true);

CREATE POLICY "products_admin_insert" ON products
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "products_admin_update" ON products
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "products_admin_delete" ON products
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "offers_admin_all" ON product_offers
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- 8. VERIFICACAO FINAL
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCRIPT EXECUTADO COM SUCESSO!';
    RAISE NOTICE 'Bucket product-images criado e configurado';
    RAISE NOTICE 'Estrutura products alinhada com codigo';
    RAISE NOTICE 'Tabela product_offers criada';
    RAISE NOTICE 'Politicas RLS permissivas configuradas';
    RAISE NOTICE 'Teste agora o cadastro de produto!';
    RAISE NOTICE '========================================';
END $$;

-- Verificar configuracao final
SELECT 'BUCKET CRIADO' as status, id, public, file_size_limit/1024/1024 as limit_mb 
FROM storage.buckets WHERE id = 'product-images';

SELECT 'CAMPOS ADICIONADOS' as status, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('image_url', 'sales_page_url', 'commission_amount', 'total_sales', 'status')
ORDER BY column_name; 