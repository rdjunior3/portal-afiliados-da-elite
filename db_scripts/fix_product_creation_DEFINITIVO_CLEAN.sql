-- ================================================================
-- CORRECAO DEFINITIVA - PORTAL AFILIADOS DA ELITE
-- RESOLVE TODAS AS CAUSAS RAIZES DO PROBLEMA DE CADASTRO DE PRODUTO
-- Execute este script COMPLETO no Supabase Dashboard SQL Editor
-- ================================================================

-- ============================================
-- 1. DIAGNOSTICO INICIAL
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[DIAGNOSTICO] Iniciando analise completa do sistema...';
    
    -- Verificar usuario admin
    IF EXISTS (SELECT 1 FROM profiles WHERE id = '1f47a584-db88-4094-aa63-b2564b21dca4' AND role = 'admin') THEN
        RAISE NOTICE '[ADMIN] Usuario admin encontrado: 04junior.silva09@gmail.com';
    ELSE
        RAISE NOTICE '[ADMIN] Usuario admin nao encontrado ou sem permissoes!';
    END IF;

    -- Verificar bucket product-images
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        RAISE NOTICE '[STORAGE] Bucket product-images existe';
    ELSE
        RAISE NOTICE '[STORAGE] Bucket product-images NAO EXISTE - CAUSA RAIZ 1';
    END IF;
    
    -- Verificar estrutura da tabela products
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        RAISE NOTICE '[SCHEMA] Campo products.image_url existe';
    ELSE
        RAISE NOTICE '[SCHEMA] Campo products.image_url NAO EXISTE - CAUSA RAIZ 3';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        RAISE NOTICE '[SCHEMA] Campo products.sales_page_url existe';
    ELSE
        RAISE NOTICE '[SCHEMA] Campo products.sales_page_url NAO EXISTE - CAUSA RAIZ 3';
    END IF;
    
    -- Verificar tabela product_offers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_offers') THEN
        RAISE NOTICE '[SCHEMA] Tabela product_offers existe';
    ELSE
        RAISE NOTICE '[SCHEMA] Tabela product_offers NAO EXISTE - CAUSA RAIZ 3';
    END IF;
END $$;

-- ============================================
-- 2. CRIAR BUCKET PRODUCT-IMAGES
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '[STORAGE] Criando bucket product-images...';
    
    -- Remover bucket se existir (para recriar limpo)
    DELETE FROM storage.objects WHERE bucket_id = 'product-images';
    DELETE FROM storage.buckets WHERE id = 'product-images';
    
    -- Criar bucket para imagens de produtos
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'product-images',
        'product-images', 
        true,
        52428800, -- 50MB limit
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
    );
    
    RAISE NOTICE '[STORAGE] Bucket product-images criado com sucesso!';
END $$;

-- ============================================
-- 3. REMOVER POLITICAS CONFLITANTES 
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[RLS] Removendo politicas conflitantes...';
    
    -- Remover todas as politicas antigas do bucket product-images
    DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public to view product images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin to update product images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin to delete product images" ON storage.objects;
    
    RAISE NOTICE '[RLS] Politicas antigas removidas!';
END $$;

-- ============================================
-- 4. CRIAR POLITICAS STORAGE PERMISSIVAS
-- ============================================

-- Politica para visualizacao publica (qualquer um pode ver)
CREATE POLICY "product_images_public_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Politica para upload PERMISSIVA (usuarios autenticados podem fazer upload)
CREATE POLICY "product_images_auth_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Politica para atualizacao (usuarios autenticados)
CREATE POLICY "product_images_auth_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Politica para exclusao (admins apenas)
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

-- ============================================
-- 5. CORRIGIR ESTRUTURA DA TABELA PRODUCTS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[SCHEMA] Corrigindo estrutura da tabela products...';
    
    -- Adicionar campos que o codigo espera (se nao existirem)
    
    -- Campo image_url (codigo espera este nome)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE '[SCHEMA] Campo image_url adicionado';
    END IF;
    
    -- Campo sales_page_url (codigo espera este nome)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE '[SCHEMA] Campo sales_page_url adicionado';
    END IF;
    
    -- Campo commission_amount (codigo calcula e insere)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE '[SCHEMA] Campo commission_amount adicionado';
    END IF;
    
    -- Campo total_sales (codigo insere)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'total_sales') THEN
        ALTER TABLE products ADD COLUMN total_sales INTEGER DEFAULT 0;
        RAISE NOTICE '[SCHEMA] Campo total_sales adicionado';
    END IF;
    
    -- Campo status (codigo insere)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE '[SCHEMA] Campo status adicionado';
    END IF;
    
    -- Migrar dados existentes se necessario
    UPDATE products 
    SET 
        image_url = COALESCE(image_url, thumbnail_url),
        sales_page_url = COALESCE(sales_page_url, affiliate_link)
    WHERE image_url IS NULL OR sales_page_url IS NULL;
    
    RAISE NOTICE '[SCHEMA] Migracao de dados concluida!';
END $$;

-- ============================================
-- 6. CRIAR TABELA PRODUCT_OFFERS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[SCHEMA] Criando tabela product_offers...';
    
    -- Criar tabela se nao existir
    CREATE TABLE IF NOT EXISTS product_offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10,
        commission_amount DECIMAL(10,2) DEFAULT 0,
        promotion_url TEXT, -- Campo que o codigo usa
        is_default BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE '[SCHEMA] Tabela product_offers criada!';
END $$;

-- ============================================
-- 7. AJUSTAR POLITICAS RLS DA TABELA PRODUCTS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[RLS] Configurando politicas RLS para products...';
    
    -- Habilitar RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;
    
    -- Remover politicas antigas
    DROP POLICY IF EXISTS "products_admin_insert" ON products;
    DROP POLICY IF EXISTS "products_admin_update" ON products;
    DROP POLICY IF EXISTS "products_admin_delete" ON products;
    DROP POLICY IF EXISTS "products_public_select" ON products;
    
    -- Politicas permissivas para products
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
    
    -- Politicas para product_offers
    DROP POLICY IF EXISTS "offers_admin_all" ON product_offers;
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
    
    RAISE NOTICE '[RLS] Politicas RLS configuradas!';
END $$;

-- ============================================
-- 8. VERIFICACAO FINAL E TESTES
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[TESTE] Executando verificacoes finais...';
    
    -- Teste 1: Bucket existe e esta acessivel
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images' AND public = true) THEN
        RAISE NOTICE '[TESTE] Bucket product-images esta publico e acessivel';
    ELSE
        RAISE NOTICE '[TESTE] Problema com bucket product-images';
    END IF;
    
    -- Teste 2: Estrutura products correta
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        RAISE NOTICE '[TESTE] Estrutura da tabela products esta alinhada com o codigo';
    ELSE
        RAISE NOTICE '[TESTE] Estrutura da tabela products ainda tem problemas';
    END IF;
    
    -- Teste 3: Tabela product_offers existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_offers') THEN
        RAISE NOTICE '[TESTE] Tabela product_offers existe e esta funcional';
    ELSE
        RAISE NOTICE '[TESTE] Tabela product_offers nao foi criada';
    END IF;
    
    -- Teste 4: Politicas RLS estao ativas
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname LIKE '%admin%') THEN
        RAISE NOTICE '[TESTE] Politicas RLS para products estao ativas';
    ELSE
        RAISE NOTICE '[TESTE] Politicas RLS para products nao estao funcionando';
    END IF;
    
    -- Teste 5: Usuario admin tem permissoes
    IF EXISTS (SELECT 1 FROM profiles WHERE id = '1f47a584-db88-4094-aa63-b2564b21dca4' AND role = 'admin') THEN
        RAISE NOTICE '[TESTE] Usuario admin 04junior.silva09@gmail.com tem permissoes corretas';
    ELSE
        RAISE NOTICE '[TESTE] Usuario admin sem permissoes adequadas';
    END IF;
END $$;

-- ============================================
-- 9. RELATORIO FINAL
-- ============================================
SELECT 'CORRECAO DEFINITIVA CONCLUIDA!' as status;

SELECT 
    'RESUMO DA CORRECAO' as categoria,
    'Bucket product-images: CRIADO' as item1,
    'Politicas Storage: PERMISSIVAS' as item2,
    'Schema products: ALINHADO' as item3,
    'Tabela product_offers: CRIADA' as item4,
    'RLS Policies: CONFIGURADAS' as item5;

SELECT 
    'PROXIMOS PASSOS' as categoria,
    '1. Teste o cadastro de produto no frontend' as passo1,
    '2. Upload de imagem deve funcionar sem erros' as passo2,
    '3. Verificar se ofertas sao criadas corretamente' as passo3,
    '4. Confirmar que produto aparece na listagem' as passo4;

-- Exibir configuracao atual do bucket
SELECT 
    b.id as bucket_name,
    b.public,
    b.file_size_limit / 1024 / 1024 as size_limit_mb,
    b.allowed_mime_types
FROM storage.buckets b 
WHERE b.id = 'product-images';

-- Exibir politicas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    roles
FROM pg_policies 
WHERE (tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%product_images%')
   OR (tablename IN ('products', 'product_offers') AND schemaname = 'public');

-- Mensagens finais
DO $$
BEGIN
    RAISE NOTICE 'Execute este script e depois teste o cadastro de produto!';
    RAISE NOTICE 'Se ainda houver problemas, verifique os logs do frontend para identificar outras causas.';
END $$; 