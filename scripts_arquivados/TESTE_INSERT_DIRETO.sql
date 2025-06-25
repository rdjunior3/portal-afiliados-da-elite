-- TESTE DE INSERÇÃO DIRETA NA TABELA PRODUCTS
-- Para identificar problemas de RLS ou campos obrigatórios

-- 1. VERIFICAR POLÍTICAS RLS ATIVAS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products' 
ORDER BY policyname;

-- 2. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- 3. TESTAR INSERÇÃO COMO ADMIN
-- Simular exatamente o que o frontend está tentando fazer
DO $$
DECLARE
    test_category_id UUID;
    test_product_id UUID;
    current_user_id UUID;
BEGIN
    -- Buscar categoria
    SELECT id INTO test_category_id FROM categories LIMIT 1;
    
    -- Simular usuário admin atual
    current_user_id := '99a703eb-9db2-48cd-affa-90fb4527c3da';
    
    RAISE NOTICE 'Testando inserção como usuário: %', current_user_id;
    RAISE NOTICE 'Categoria selecionada: %', test_category_id;
    
    -- Inserção EXATA que o frontend está tentando
    INSERT INTO products (
        name,
        description,
        category_id,
        image_url,
        affiliate_link,
        sales_page_url,
        price,
        commission_rate,
        commission_amount,
        tags,
        is_active,
        slug,
        currency
    ) VALUES (
        'Teste Frontend',
        'Produto de teste simulando frontend',
        test_category_id,
        'https://vhociemaoccrkpcylpit.supabase.co/storage/v1/object/public/product-images/products/teste.png',
        'https://exemplo.com/affiliate-link',
        'https://exemplo.com/affiliate-link',
        99.90,
        15.0,
        14.99,
        ARRAY['teste', 'frontend'],
        true,
        'teste-frontend',
        'BRL'
    ) RETURNING id INTO test_product_id;
    
    IF test_product_id IS NOT NULL THEN
        RAISE NOTICE 'SUCCESS: Produto inserido com ID %', test_product_id;
        
        -- Verificar se foi realmente inserido
        IF EXISTS (SELECT 1 FROM products WHERE id = test_product_id) THEN
            RAISE NOTICE 'CONFIRMED: Produto existe na tabela';
        ELSE
            RAISE NOTICE 'ERROR: Produto não encontrado após inserção';
        END IF;
        
        -- Remover teste
        DELETE FROM products WHERE id = test_product_id;
        RAISE NOTICE 'CLEANUP: Produto de teste removido';
    ELSE
        RAISE NOTICE 'ERROR: INSERT não retornou ID';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
        RAISE NOTICE 'ERROR CODE: %', SQLSTATE;
END $$;

-- 4. VERIFICAR PERMISSÕES DO USUÁRIO ADMIN
SELECT 
    p.id,
    p.email,
    p.role,
    p.affiliate_status
FROM profiles p 
WHERE p.id = '99a703eb-9db2-48cd-affa-90fb4527c3da';

-- 5. TESTAR POLÍTICA RLS MANUALMENTE
-- Simular contexto de autenticação
SELECT auth.uid(); -- Verificar se há contexto de auth

-- 6. VERIFICAR CONSTRAINTS DA TABELA
SELECT 
    conname,
    contype,
    confrelid::regclass,
    conkey,
    confkey,
    consrc
FROM pg_constraint 
WHERE conrelid = 'products'::regclass; 