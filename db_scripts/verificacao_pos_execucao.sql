-- ================================================================
-- VERIFICAÇÃO COMPLETA PÓS-EXECUÇÃO DO SCRIPT
-- Portal Afiliados da Elite - Análise de Status
-- Execute no Supabase Dashboard para verificar se tudo funcionou
-- ================================================================

-- ============================================
-- 1. VERIFICAÇÃO DE BUCKETS STORAGE
-- ============================================
DO $$
DECLARE
    bucket_record RECORD;
    total_buckets INTEGER := 0;
BEGIN
    RAISE NOTICE '🪣 ============ ANÁLISE DE BUCKETS STORAGE ============';
    
    -- Listar todos os buckets
    FOR bucket_record IN 
        SELECT id, name, public, file_size_limit, allowed_mime_types 
        FROM storage.buckets 
        ORDER BY id
    LOOP
        total_buckets := total_buckets + 1;
        RAISE NOTICE '✅ Bucket: % | Público: % | Tamanho: %MB | Tipos: %', 
            bucket_record.id, 
            bucket_record.public,
            bucket_record.file_size_limit / 1048576,
            bucket_record.allowed_mime_types;
    END LOOP;
    
    RAISE NOTICE '📊 Total de buckets configurados: %', total_buckets;
    
    -- Verificação específica do bucket crítico
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        RAISE NOTICE '🎯 BUCKET PRODUCT-IMAGES: ✅ CONFIGURADO CORRETAMENTE';
    ELSE
        RAISE NOTICE '🎯 BUCKET PRODUCT-IMAGES: ❌ AINDA NÃO EXISTE';
    END IF;
    
    RAISE NOTICE '🪣 ===============================================';
END $$;

-- ============================================
-- 2. VERIFICAÇÃO DE POLÍTICAS RLS STORAGE
-- ============================================
DO $$
DECLARE
    policy_record RECORD;
    total_policies INTEGER := 0;
BEGIN
    RAISE NOTICE '🔒 ========== ANÁLISE DE POLÍTICAS RLS STORAGE ==========';
    
    -- Listar políticas de storage
    FOR policy_record IN 
        SELECT policyname, cmd, roles 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname LIKE '%product_images%'
        ORDER BY policyname
    LOOP
        total_policies := total_policies + 1;
        RAISE NOTICE '🔐 Política: % | Comando: % | Roles: %', 
            policy_record.policyname, 
            policy_record.cmd,
            policy_record.roles;
    END LOOP;
    
    RAISE NOTICE '📊 Total de políticas product-images: %', total_policies;
    
    IF total_policies >= 4 THEN
        RAISE NOTICE '🎯 POLÍTICAS STORAGE: ✅ COMPLETAS (SELECT, INSERT, UPDATE, DELETE)';
    ELSE
        RAISE NOTICE '🎯 POLÍTICAS STORAGE: ⚠️ INCOMPLETAS (esperado: 4, encontrado: %)', total_policies;
    END IF;
    
    RAISE NOTICE '🔒 ===============================================';
END $$;

-- ============================================
-- 3. VERIFICAÇÃO DE ESTRUTURA DE TABELAS
-- ============================================
DO $$
DECLARE
    table_record RECORD;
    column_record RECORD;
    missing_fields TEXT := '';
BEGIN
    RAISE NOTICE '📊 ============ ANÁLISE DE ESTRUTURA DE TABELAS ============';
    
    -- Verificar tabelas principais
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'products', 'categories', 'product_offers', 'elite_tips', 'chat_rooms', 'courses', 'lessons', 'messages')
        ORDER BY table_name
    LOOP
        RAISE NOTICE '✅ Tabela: %', table_record.table_name;
    END LOOP;
    
    -- Verificar campos críticos da tabela products
    RAISE NOTICE '📋 Verificando campos críticos da tabela PRODUCTS:';
    
    -- Lista de campos esperados pelo frontend
    FOR column_record IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name IN ('id', 'name', 'description', 'price', 'commission_rate', 'category_id', 'image_url', 'sales_page_url', 'status', 'is_active', 'total_sales')
        ORDER BY column_name
    LOOP
        RAISE NOTICE '  ✅ %: % (%)', 
            column_record.column_name, 
            column_record.data_type,
            CASE WHEN column_record.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END;
    END LOOP;
    
    -- Verificar campos ausentes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        missing_fields := missing_fields || 'image_url, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        missing_fields := missing_fields || 'sales_page_url, ';
    END IF;
    
    IF missing_fields != '' THEN
        RAISE NOTICE '⚠️ CAMPOS AUSENTES: %', TRIM(TRAILING ', ' FROM missing_fields);
    ELSE
        RAISE NOTICE '🎯 ESTRUTURA PRODUCTS: ✅ TODOS OS CAMPOS NECESSÁRIOS EXISTEM';
    END IF;
    
    RAISE NOTICE '📊 ===============================================';
END $$;

-- ============================================
-- 4. VERIFICAÇÃO DE POLÍTICAS RLS TABELAS
-- ============================================
DO $$
DECLARE
    table_policy_record RECORD;
    products_policies INTEGER := 0;
BEGIN
    RAISE NOTICE '🔐 ========== ANÁLISE DE POLÍTICAS RLS TABELAS ==========';
    
    -- Contar políticas da tabela products
    SELECT COUNT(*) INTO products_policies
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products';
    
    RAISE NOTICE '📊 Políticas na tabela PRODUCTS: %', products_policies;
    
    -- Listar políticas específicas
    FOR table_policy_record IN 
        SELECT policyname, cmd, roles
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'products'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '  🔐 %: % para %', 
            table_policy_record.policyname,
            table_policy_record.cmd,
            table_policy_record.roles;
    END LOOP;
    
    IF products_policies >= 3 THEN
        RAISE NOTICE '🎯 POLÍTICAS PRODUCTS: ✅ SUFICIENTES PARA OPERAÇÃO';
    ELSE
        RAISE NOTICE '🎯 POLÍTICAS PRODUCTS: ⚠️ PODEM ESTAR INSUFICIENTES';
    END IF;
    
    RAISE NOTICE '🔐 ===============================================';
END $$;

-- ============================================
-- 5. VERIFICAÇÃO DE DADOS EXISTENTES
-- ============================================
DO $$
DECLARE
    profiles_count INTEGER;
    products_count INTEGER;
    categories_count INTEGER;
    tips_count INTEGER;
    rooms_count INTEGER;
BEGIN
    RAISE NOTICE '📈 ============ ANÁLISE DE DADOS EXISTENTES ============';
    
    -- Contar registros nas tabelas principais
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO categories_count FROM categories;
    
    -- Verificar tabelas opcionais
    SELECT COUNT(*) INTO tips_count FROM elite_tips WHERE true;
    SELECT COUNT(*) INTO rooms_count FROM chat_rooms WHERE true;
    
    RAISE NOTICE '👥 Profiles (usuários): % registros', profiles_count;
    RAISE NOTICE '🛍️ Products (produtos): % registros', products_count;
    RAISE NOTICE '📂 Categories (categorias): % registros', categories_count;
    RAISE NOTICE '💡 Elite Tips: % registros', tips_count;
    RAISE NOTICE '💬 Chat Rooms: % registros', rooms_count;
    
    IF profiles_count > 0 AND categories_count > 0 THEN
        RAISE NOTICE '🎯 DADOS BÁSICOS: ✅ SISTEMA TEM DADOS MÍNIMOS PARA FUNCIONAR';
    ELSE
        RAISE NOTICE '🎯 DADOS BÁSICOS: ⚠️ SISTEMA PRECISA DE DADOS INICIAIS';
    END IF;
    
    RAISE NOTICE '📈 ===============================================';
END $$;

-- ============================================
-- 6. TESTE SINTÉTICO DE FUNCIONALIDADE
-- ============================================
DO $$
DECLARE
    test_bucket_exists BOOLEAN;
    test_policies_count BOOLEAN;
    test_table_ready BOOLEAN;
    can_upload BOOLEAN := false;
    can_create_product BOOLEAN := false;
BEGIN
    RAISE NOTICE '🧪 ============ TESTE SINTÉTICO DE FUNCIONALIDADES ============';
    
    -- Teste 1: Bucket existe
    SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO test_bucket_exists;
    
    -- Teste 2: Políticas suficientes
    SELECT COUNT(*) >= 4 
    INTO test_policies_count 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%product_images%';
    
    -- Teste 3: Tabela products pronta
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name IN ('image_url', 'sales_page_url', 'commission_rate')
        GROUP BY table_name 
        HAVING COUNT(*) >= 3
    ) INTO test_table_ready;
    
    -- Avaliar capacidade de upload
    can_upload := test_bucket_exists AND test_policies_count;
    
    -- Avaliar capacidade de criar produto
    can_create_product := test_table_ready AND can_upload;
    
    RAISE NOTICE '🧪 RESULTADOS DOS TESTES:';
    RAISE NOTICE '  📦 Upload de imagens: %', CASE WHEN can_upload THEN '✅ FUNCIONANDO' ELSE '❌ PROBLEMA' END;
    RAISE NOTICE '  🛍️ Cadastro de produtos: %', CASE WHEN can_create_product THEN '✅ FUNCIONANDO' ELSE '❌ PROBLEMA' END;
    
    IF can_create_product THEN
        RAISE NOTICE '🎉 STATUS GERAL: ✅ SISTEMA 100% FUNCIONAL PARA CADASTRO DE PRODUTOS!';
        RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
        RAISE NOTICE '   1. Teste o cadastro de um produto na interface';
        RAISE NOTICE '   2. Verifique se o upload de imagens funciona';
        RAISE NOTICE '   3. Monitore os logs do console para confirmação';
    ELSE
        RAISE NOTICE '⚠️ STATUS GERAL: SISTEMA AINDA TEM PROBLEMAS PENDENTES';
        RAISE NOTICE '📋 AÇÕES NECESSÁRIAS:';
        IF NOT test_bucket_exists THEN
            RAISE NOTICE '   ❌ Executar script para criar bucket product-images';
        END IF;
        IF NOT test_policies_count THEN
            RAISE NOTICE '   ❌ Configurar políticas RLS do storage';
        END IF;
        IF NOT test_table_ready THEN
            RAISE NOTICE '   ❌ Corrigir estrutura da tabela products';
        END IF;
    END IF;
    
    RAISE NOTICE '🧪 ===============================================';
END $$;

-- ============================================
-- 7. RELATÓRIO FINAL CONSOLIDADO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 ================ RELATÓRIO FINAL ================';
    RAISE NOTICE '🕐 Verificação executada em: %', NOW();
    RAISE NOTICE '🎯 Portal Afiliados da Elite - Status do Sistema';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Se todos os itens acima mostram ✅, o cadastro de produtos deve funcionar';
    RAISE NOTICE '⚠️ Se algum item mostra ❌, consulte as instruções específicas acima';
    RAISE NOTICE '🔄 Execute este script novamente após fazer correções';
    RAISE NOTICE '';
    RAISE NOTICE '📞 Em caso de dúvidas, consulte os logs detalhados acima';
    RAISE NOTICE '📋 ================ FIM DO RELATÓRIO ================';
END $$; 