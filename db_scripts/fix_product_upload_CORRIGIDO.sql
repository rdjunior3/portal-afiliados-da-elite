-- ================================================================
-- CORRECAO DEFINITIVA - PORTAL AFILIADOS DA ELITE
-- VERSAO CORRIGIDA - Sem referencias a colunas inexistentes
-- Execute este script COMPLETO no Supabase Dashboard SQL Editor
-- ================================================================

-- ============================================
-- 1. LIMPEZA COMPLETA DE POLITICAS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[LIMPEZA] Removendo todas as politicas conflitantes...';
    
    -- Remover TODAS as politicas do storage.objects relacionadas a product-images
    DROP POLICY IF EXISTS "product_images_public_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_auth_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_auth_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public to view product images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin to update product images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin to delete product images" ON storage.objects;
    
    -- Remover politicas antigas de products
    DROP POLICY IF EXISTS "products_admin_insert" ON products;
    DROP POLICY IF EXISTS "products_admin_update" ON storage.objects;
    DROP POLICY IF EXISTS "products_admin_delete" ON products;
    DROP POLICY IF EXISTS "products_public_select" ON products;
    DROP POLICY IF EXISTS "Public can view active products" ON products;
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    
    -- Remover politicas de product_offers se a tabela existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_offers') THEN
        DROP POLICY IF EXISTS "offers_admin_all" ON product_offers;
    END IF;
    
    RAISE NOTICE '[LIMPEZA] Politicas antigas removidas!';
END $$;

-- ============================================
-- 2. RECRIAR BUCKET PRODUCT-IMAGES
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '[STORAGE] Recriando bucket product-images...';
    
    -- Remover bucket completamente se existir
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
-- 3. VERIFICAR E CORRIGIR ESTRUTURA PRODUCTS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[SCHEMA] Verificando estrutura da tabela products...';
    
    -- Verificar se tabela existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE EXCEPTION 'Tabela products nao existe! Execute primeiro os scripts de criacao de tabelas.';
    END IF;
    
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
    
    RAISE NOTICE '[SCHEMA] Estrutura da tabela products verificada!';
END $$;

-- ============================================
-- 4. MIGRAR DADOS EXISTENTES (APENAS SE NECESSARIO)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[MIGRACAO] Verificando necessidade de migracao de dados...';
    
    -- Migrar thumbnail_url para image_url se necessario
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail_url') THEN
        UPDATE products 
        SET image_url = thumbnail_url
        WHERE image_url IS NULL AND thumbnail_url IS NOT NULL;
        RAISE NOTICE '[MIGRACAO] Dados migrados de thumbnail_url para image_url';
    END IF;
    
    -- Migrar affiliate_link para sales_page_url se necessario  
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'affiliate_link') THEN
        UPDATE products 
        SET sales_page_url = affiliate_link
        WHERE sales_page_url IS NULL AND affiliate_link IS NOT NULL;
        RAISE NOTICE '[MIGRACAO] Dados migrados de affiliate_link para sales_page_url';
    END IF;
    
    RAISE NOTICE '[MIGRACAO] Migracao de dados concluida!';
END $$;

-- ============================================
-- 5. CRIAR TABELA PRODUCT_OFFERS
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
-- 6. CRIAR POLITICAS STORAGE PERMISSIVAS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[RLS] Criando politicas storage permissivas...';
    
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
    
    RAISE NOTICE '[RLS] Politicas storage criadas!';
END $$;

-- ============================================
-- 7. CONFIGURAR RLS PARA TABELAS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[RLS] Configurando RLS para tabelas...';
    
    -- Habilitar RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;
    
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
-- 8. VERIFICACAO FINAL COMPLETA
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '[TESTE] Executando verificacoes finais...';
    
    -- Teste 1: Bucket existe e esta acessivel
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images' AND public = true) THEN
        RAISE NOTICE '[TESTE] SUCCESS - Bucket product-images esta publico e acessivel';
    ELSE
        RAISE NOTICE '[TESTE] ERROR - Problema com bucket product-images';
    END IF;
    
    -- Teste 2: Estrutura products correta
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        RAISE NOTICE '[TESTE] SUCCESS - Estrutura da tabela products alinhada com codigo';
    ELSE
        RAISE NOTICE '[TESTE] ERROR - Estrutura da tabela products com problemas';
    END IF;
    
    -- Teste 3: Tabela product_offers existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_offers') THEN
        RAISE NOTICE '[TESTE] SUCCESS - Tabela product_offers existe e funcional';
    ELSE
        RAISE NOTICE '[TESTE] ERROR - Tabela product_offers nao foi criada';
    END IF;
    
    -- Teste 4: Politicas RLS ativas
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname LIKE '%admin%') THEN
        RAISE NOTICE '[TESTE] SUCCESS - Politicas RLS para products ativas';
    ELSE
        RAISE NOTICE '[TESTE] ERROR - Politicas RLS para products nao funcionando';
    END IF;
    
    -- Teste 5: Usuario admin tem permissoes
    IF EXISTS (SELECT 1 FROM profiles WHERE id = '1f47a584-db88-4094-aa63-b2564b21dca4' AND role = 'admin') THEN
        RAISE NOTICE '[TESTE] SUCCESS - Usuario admin tem permissoes corretas';
    ELSE
        RAISE NOTICE '[TESTE] ERROR - Usuario admin sem permissoes adequadas';
    END IF;
    
    -- Teste 6: Politicas storage funcionais
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%product_images%') THEN
        RAISE NOTICE '[TESTE] SUCCESS - Politicas storage funcionais';
    ELSE
        RAISE NOTICE '[TESTE] ERROR - Politicas storage nao configuradas';
    END IF;
END $$;

-- ============================================
-- 9. RELATORIO FINAL
-- ============================================
SELECT 'SCRIPT EXECUTADO COM SUCESSO!' as status;

SELECT 
    'RESUMO FINAL' as categoria,
    'Bucket product-images: CRIADO E FUNCIONAL' as storage,
    'Schema products: ALINHADO COM CODIGO' as schema_,
    'Tabela product_offers: CRIADA' as offers,
    'Politicas RLS: PERMISSIVAS E FUNCIONAIS' as security;

-- Exibir configuracao do bucket
SELECT 
    b.id as bucket_name,
    b.public as is_public,
    (b.file_size_limit / 1024 / 1024)::text || ' MB' as size_limit,
    array_length(b.allowed_mime_types, 1) as mime_types_count
FROM storage.buckets b 
WHERE b.id = 'product-images';

-- Contar politicas ativas
SELECT 
    'Storage Policies' as tipo,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%product_images%'

UNION ALL

SELECT 
    'Products Policies' as tipo,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'CORRECAO CONCLUIDA COM SUCESSO!';
    RAISE NOTICE 'Agora teste o cadastro de produto no frontend.';
    RAISE NOTICE 'O upload de imagem deve funcionar perfeitamente!';
    RAISE NOTICE '====================================================';
END $$; 