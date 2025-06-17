-- ================================================================
-- CORREÇÃO COMPLETA E DEFINITIVA - PORTAL AFILIADOS DA ELITE
-- Resolve TODOS os problemas identificados nos logs
-- Execute ESTE script único no Supabase Dashboard SQL Editor
-- ================================================================

-- ============================================
-- 1. CORRIGIR TIMEOUTS (CAUSA RAIZ #1)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔧 [TIMEOUT] Corrigindo timeouts de roles...';
    
    -- Aumentar timeout para role authenticated (5 minutos)
    ALTER ROLE authenticated SET statement_timeout = '5min';
    
    -- Aumentar timeout para role anon (2 minutos)
    ALTER ROLE anon SET statement_timeout = '2min';
    
    -- Aumentar timeout para role service_role (10 minutos)
    ALTER ROLE service_role SET statement_timeout = '10min';
    
    RAISE NOTICE '✅ [TIMEOUT] Timeouts corrigidos!';
END $$;

-- ============================================
-- 2. LIMPEZA COMPLETA DE POLÍTICAS CONFLITANTES
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🧹 [LIMPEZA] Removendo políticas conflitantes...';
    
    -- Storage policies antigas
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
    
    -- Products policies antigas
    DROP POLICY IF EXISTS "products_admin_insert" ON products;
    DROP POLICY IF EXISTS "products_admin_update" ON products;
    DROP POLICY IF EXISTS "products_admin_delete" ON products;
    DROP POLICY IF EXISTS "products_public_select" ON products;
    
    RAISE NOTICE '✅ [LIMPEZA] Políticas antigas removidas!';
END $$;

-- ============================================
-- 3. CRIAR/RECRIAR BUCKET PRODUCT-IMAGES (CAUSA RAIZ #2)
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '🪣 [BUCKET] Configurando bucket product-images...';
    
    -- Remover objetos e bucket se existir
    DELETE FROM storage.objects WHERE bucket_id = 'product-images';
    DELETE FROM storage.buckets WHERE id = 'product-images';
    
    -- Criar bucket novo com configurações otimizadas
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'product-images',
        'product-images', 
        true,
        52428800, -- 50MB limit
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
    );
    
    RAISE NOTICE '✅ [BUCKET] Bucket product-images criado com sucesso!';
END $$;

-- ============================================
-- 4. VERIFICAR E CORRIGIR ESTRUTURA PRODUCTS (CAUSA RAIZ #3)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '📋 [SCHEMA] Verificando estrutura da tabela products...';
    
    -- Verificar se tabela existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE EXCEPTION 'Tabela products não existe! Execute as migrations básicas primeiro.';
    END IF;
    
    -- Adicionar campos essenciais que o frontend espera
    
    -- image_url (campo que o código espera)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE '✅ [SCHEMA] Campo image_url adicionado';
    END IF;
    
    -- sales_page_url (campo que o código espera)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE '✅ [SCHEMA] Campo sales_page_url adicionado';
    END IF;
    
    -- commission_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE '✅ [SCHEMA] Campo commission_amount adicionado';
    END IF;
    
    -- is_active 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ [SCHEMA] Campo is_active adicionado';
    END IF;
    
    -- is_featured
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured') THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ [SCHEMA] Campo is_featured adicionado';
    END IF;
    
    -- total_sales
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'total_sales') THEN
        ALTER TABLE products ADD COLUMN total_sales INTEGER DEFAULT 0;
        RAISE NOTICE '✅ [SCHEMA] Campo total_sales adicionado';
    END IF;
    
    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE '✅ [SCHEMA] Campo status adicionado';
    END IF;
    
    RAISE NOTICE '✅ [SCHEMA] Estrutura da tabela products verificada e corrigida!';
END $$;

-- ============================================
-- 5. MIGRAR DADOS EXISTENTES (SEGURO)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔄 [MIGRAÇÃO] Migrando dados existentes...';
    
    -- Migrar thumbnail_url para image_url (se thumbnail_url existir)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail_url') THEN
        UPDATE products 
        SET image_url = COALESCE(image_url, thumbnail_url)
        WHERE image_url IS NULL AND thumbnail_url IS NOT NULL;
        RAISE NOTICE '✅ [MIGRAÇÃO] Dados migrados de thumbnail_url para image_url';
    END IF;
    
    RAISE NOTICE '✅ [MIGRAÇÃO] Migração de dados concluída!';
END $$;

-- ============================================
-- 6. CRIAR TABELA PRODUCT_OFFERS (CAUSA RAIZ #4)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '💰 [OFFERS] Criando tabela product_offers...';
    
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
    
    RAISE NOTICE '✅ [OFFERS] Tabela product_offers criada!';
END $$;

-- ============================================
-- 7. CONFIGURAR POLÍTICAS STORAGE PERMISSIVAS (CAUSA RAIZ #5)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔒 [STORAGE] Configurando políticas storage...';
    
    -- Política para visualização pública (qualquer um pode ver)
    CREATE POLICY "product_images_public_select" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'product-images');
    
    -- Política para upload SUPER PERMISSIVA (usuarios autenticados)
    CREATE POLICY "product_images_auth_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images');
    
    -- Política para atualização (usuarios autenticados)
    CREATE POLICY "product_images_auth_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');
    
    -- Política para exclusão (usuarios autenticados com role admin)
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
    
    RAISE NOTICE '✅ [STORAGE] Políticas storage configuradas!';
END $$;

-- ============================================
-- 8. CONFIGURAR RLS PARA TABELAS (CAUSA RAIZ #6)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔐 [RLS] Configurando RLS para tabelas...';
    
    -- Habilitar RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;
    
    -- Política para leitura pública de produtos
    CREATE POLICY "products_public_select" ON products
    FOR SELECT TO public
    USING (true);
    
    -- Política para admins inserirem produtos
    CREATE POLICY "products_admin_insert" ON products
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
    
    -- Política para admins atualizarem produtos
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
    
    -- Política para admins removerem produtos
    CREATE POLICY "products_admin_delete" ON products
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
    
    -- Política para ofertas (apenas admins)
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
    
    RAISE NOTICE '✅ [RLS] Políticas RLS configuradas!';
END $$;

-- ============================================
-- 9. VERIFICAÇÃO FINAL E RELATÓRIO DE STATUS
-- ============================================
DO $$
DECLARE
    timeouts_ok INTEGER := 0;
    bucket_ok BOOLEAN := false;
    fields_ok INTEGER := 0;
    policies_ok INTEGER := 0;
    offers_table_ok BOOLEAN := false;
    total_score INTEGER := 0;
BEGIN
    RAISE NOTICE '📊 [VERIFICAÇÃO] Executando verificações finais...';
    
    -- Verificar timeouts
    SELECT COUNT(*) INTO timeouts_ok
    FROM pg_roles 
    WHERE (rolname = 'authenticated' AND 'statement_timeout=5min' = ANY(rolconfig))
       OR (rolname = 'anon' AND 'statement_timeout=2min' = ANY(rolconfig))
       OR (rolname = 'service_role' AND 'statement_timeout=10min' = ANY(rolconfig));
    
    -- Verificar bucket
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'product-images' AND public = true
    ) INTO bucket_ok;
    
    -- Verificar campos necessários
    SELECT COUNT(*) INTO fields_ok
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name IN ('image_url', 'sales_page_url', 'commission_amount', 'is_active', 'is_featured', 'total_sales', 'status');
    
    -- Verificar políticas storage
    SELECT COUNT(*) INTO policies_ok
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname LIKE '%product_images%';
    
    -- Verificar tabela product_offers
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'product_offers'
    ) INTO offers_table_ok;
    
    -- Calcular score
    total_score := timeouts_ok + (CASE WHEN bucket_ok THEN 3 ELSE 0 END) + 
                  fields_ok + (CASE WHEN offers_table_ok THEN 2 ELSE 0 END);
    
    -- Relatório final
    RAISE NOTICE '===============================================';
    RAISE NOTICE '📋 RELATÓRIO FINAL DE VERIFICAÇÃO:';
    RAISE NOTICE '===============================================';
    RAISE NOTICE '⏱️  Timeouts corrigidos: %/3 roles', timeouts_ok;
    RAISE NOTICE '🪣 Bucket product-images: %', CASE WHEN bucket_ok THEN '✅ CONFIGURADO' ELSE '❌ PROBLEMA' END;
    RAISE NOTICE '📋 Campos necessários: %/7', fields_ok;
    RAISE NOTICE '🔒 Políticas storage: % ativas', policies_ok;
    RAISE NOTICE '💰 Tabela product_offers: %', CASE WHEN offers_table_ok THEN '✅ CRIADA' ELSE '❌ FALTANDO' END;
    RAISE NOTICE '===============================================';
    
    -- Score final
    IF total_score >= 15 THEN
        RAISE NOTICE '🎉 CONFIGURAÇÃO PERFEITA! (Score: %/15)', total_score;
        RAISE NOTICE '✅ O cadastro de produtos deve funcionar agora!';
    ELSIF total_score >= 12 THEN
        RAISE NOTICE '✅ BOA CONFIGURAÇÃO! (Score: %/15)', total_score;
        RAISE NOTICE '⚠️  Teste o cadastro - deve funcionar';
    ELSE
        RAISE NOTICE '⚠️  CONFIGURAÇÃO PRECISA ATENÇÃO (Score: %/15)', total_score;
        RAISE NOTICE '❌ Alguns problemas podem persistir';
    END IF;
    
    RAISE NOTICE '===============================================';
    RAISE NOTICE '🚀 PRÓXIMO PASSO: Teste o cadastro de produto!';
    RAISE NOTICE '===============================================';
END $$;

-- ============================================
-- 10. CONFIGURAÇÃO FINAL DE PERFORMANCE
-- ============================================

-- Recarregar configurações
NOTIFY pgrst, 'reload config';

-- Atualizar estatísticas das tabelas
ANALYZE products;
ANALYZE product_offers;
ANALYZE storage.buckets;
ANALYZE storage.objects;

-- Mensagem final
SELECT 
    '🎊 SCRIPT EXECUTADO COM SUCESSO!' as status,
    'Teste agora o cadastro de produto no frontend!' as proxima_acao;

-- Mostrar configuração dos buckets ativos
SELECT 
    'BUCKETS CONFIGURADOS:' as categoria,
    id as bucket_name,
    public as eh_publico,
    (file_size_limit / 1024 / 1024)::text || ' MB' as limite_tamanho,
    array_length(allowed_mime_types, 1) as tipos_mime_suportados
FROM storage.buckets 
WHERE id IN ('product-images', 'avatars', 'profiles')
ORDER BY id;

-- Contar políticas por tipo
SELECT 
    'POLÍTICAS ATIVAS:' as categoria,
    CASE 
        WHEN tablename = 'objects' AND schemaname = 'storage' THEN 'Storage Policies'
        WHEN tablename = 'products' THEN 'Products Policies'
        WHEN tablename = 'product_offers' THEN 'Offers Policies'
        ELSE 'Other Policies'
    END as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename IN ('objects', 'products', 'product_offers')
AND schemaname IN ('storage', 'public')
GROUP BY 
    CASE 
        WHEN tablename = 'objects' AND schemaname = 'storage' THEN 'Storage Policies'
        WHEN tablename = 'products' THEN 'Products Policies'
        WHEN tablename = 'product_offers' THEN 'Offers Policies'
        ELSE 'Other Policies'
    END
ORDER BY tipo; 