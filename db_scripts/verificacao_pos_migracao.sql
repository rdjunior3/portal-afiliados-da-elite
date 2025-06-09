-- ================================================================
-- SCRIPT DE VERIFICAÇÃO PÓS-MIGRAÇÃO
-- Verificar se todas as atualizações foram aplicadas corretamente
-- ================================================================

-- ============================================
-- 1. VERIFICAR ESTRUTURA DA TABELA PRODUCTS
-- ============================================

SELECT 
    'TABELA PRODUCTS - ESTRUTURA' as verificacao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 2. VERIFICAR ENUM product_status
-- ============================================

SELECT 
    'ENUM PRODUCT_STATUS' as verificacao,
    enumlabel as valores_enum
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_status')
ORDER BY enumsortorder;

-- ============================================
-- 3. VERIFICAR BUCKETS DE STORAGE
-- ============================================

SELECT 
    'STORAGE BUCKETS' as verificacao,
    id as bucket_id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id IN ('products', 'product-images', 'avatars', 'profiles')
ORDER BY id;

-- ============================================
-- 4. VERIFICAR POLÍTICAS RLS
-- ============================================

-- Políticas da tabela products
SELECT 
    'POLÍTICAS RLS - PRODUCTS' as verificacao,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'products' 
AND schemaname = 'public'
ORDER BY policyname;

-- Políticas do storage
SELECT 
    'POLÍTICAS RLS - STORAGE' as verificacao,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%product%' OR policyname LIKE '%avatar%'
ORDER BY policyname;

-- ============================================
-- 5. VERIFICAR ÍNDICES
-- ============================================

SELECT 
    'ÍNDICES - PRODUCTS' as verificacao,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'products' 
AND schemaname = 'public'
AND indexname LIKE 'idx_products_%'
ORDER BY indexname;

-- ============================================
-- 6. VERIFICAR CONSTRAINTS
-- ============================================

SELECT 
    'CONSTRAINTS - PRODUCTS' as verificacao,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
AND conname LIKE 'valid_%'
ORDER BY conname;

-- ============================================
-- 7. VERIFICAR TRIGGERS
-- ============================================

SELECT 
    'TRIGGERS' as verificacao,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('products', 'profiles')
AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 8. VERIFICAR CATEGORIAS PADRÃO
-- ============================================

SELECT 
    'CATEGORIAS PADRÃO' as verificacao,
    name,
    slug,
    color
FROM categories 
ORDER BY name;

-- ============================================
-- 9. TESTE DE FUNCIONALIDADE
-- ============================================

-- Testar inserção de produto com nova estrutura
DO $$
DECLARE
    test_product_id UUID;
    success_count INTEGER := 0;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '      TESTE DE FUNCIONALIDADES         ';
    RAISE NOTICE '==========================================';
    
    -- Teste 1: Inserir produto com sales_page_url
    BEGIN
        INSERT INTO products (
            name,
            slug,
            description,
            price,
            commission_rate,
            affiliate_link,
            sales_page_url,
            status,
            is_featured,
            is_exclusive,
            gravity_score,
            earnings_per_click,
            conversion_rate_avg,
            refund_rate
        ) VALUES (
            'Produto Teste Completo',
            'produto-teste-completo-' || floor(random()*1000),
            'Produto para testar nova estrutura',
            199.90,
            25.00,
            'https://exemplo.com/afiliado',
            'https://exemplo.com/pagina-vendas',
            'active',
            true,
            false,
            85,
            2.50,
            8.5,
            5.0
        ) RETURNING id INTO test_product_id;
        
        success_count := success_count + 1;
        RAISE NOTICE '✅ Teste 1: Inserção de produto - SUCESSO';
        
        -- Teste 2: Atualizar produto
        UPDATE products 
        SET sales_page_url = 'https://exemplo.com/nova-pagina',
            earnings_per_click = 3.00
        WHERE id = test_product_id;
        
        success_count := success_count + 1;
        RAISE NOTICE '✅ Teste 2: Atualização de produto - SUCESSO';
        
        -- Teste 3: Verificar trigger updated_at
        IF EXISTS (
            SELECT 1 FROM products 
            WHERE id = test_product_id 
            AND updated_at > created_at
        ) THEN
            success_count := success_count + 1;
            RAISE NOTICE '✅ Teste 3: Trigger updated_at - SUCESSO';
        END IF;
        
        -- Limpar teste
        DELETE FROM products WHERE id = test_product_id;
        RAISE NOTICE '🧹 Produto de teste removido';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro nos testes: %', SQLERRM;
    END;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'TESTES CONCLUÍDOS: % de 3 passaram', success_count;
    RAISE NOTICE '==========================================';
    
END $$;

-- ============================================
-- 10. RELATÓRIO FINAL DE VERIFICAÇÃO
-- ============================================

DO $$
DECLARE
    products_columns INTEGER;
    storage_buckets INTEGER;
    rls_policies INTEGER;
    required_indexes INTEGER;
    constraints_count INTEGER;
BEGIN
    -- Contar elementos verificados
    SELECT COUNT(*) INTO products_columns
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name IN ('sales_page_url', 'gravity_score', 'earnings_per_click', 'conversion_rate_avg', 'is_featured', 'is_exclusive');
    
    SELECT COUNT(*) INTO storage_buckets
    FROM storage.buckets 
    WHERE id IN ('products', 'product-images', 'avatars', 'profiles');
    
    SELECT COUNT(*) INTO rls_policies
    FROM pg_policies 
    WHERE tablename = 'products' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO required_indexes
    FROM pg_indexes 
    WHERE tablename = 'products' 
    AND indexname LIKE 'idx_products_%';
    
    SELECT COUNT(*) INTO constraints_count
    FROM pg_constraint 
    WHERE conrelid = 'products'::regclass
    AND conname LIKE 'valid_%';
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE '         RELATÓRIO DE VERIFICAÇÃO          ';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '📊 Colunas products: %/6 esperadas', products_columns;
    RAISE NOTICE '🪣 Storage buckets: %/4 esperados', storage_buckets;
    RAISE NOTICE '🔒 Políticas RLS products: %', rls_policies;
    RAISE NOTICE '📈 Índices products: %', required_indexes;
    RAISE NOTICE '✅ Constraints validação: %', constraints_count;
    RAISE NOTICE '=============================================';
    
    -- Status geral
    IF products_columns = 6 AND storage_buckets >= 2 AND rls_policies >= 1 THEN
        RAISE NOTICE '🎉 STATUS: MIGRAÇÃO BEM-SUCEDIDA';
    ELSE
        RAISE NOTICE '⚠️ STATUS: MIGRAÇÃO INCOMPLETA - VERIFICAR ITENS ACIMA';
    END IF;
    
END $$;

-- Resultado final
SELECT 
    '✅ Verificação pós-migração concluída!' as resultado,
    NOW() as verificado_em; 