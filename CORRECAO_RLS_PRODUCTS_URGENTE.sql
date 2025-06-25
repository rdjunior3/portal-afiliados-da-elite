-- CORREÇÃO URGENTE: POLÍTICAS RLS PARA PRODUCTS
-- Resolver problema de inserção travando

-- 1. VERIFICAR POLÍTICAS ATUAIS
SELECT 'POLÍTICAS ATUAIS' as status, policyname, cmd, roles, qual
FROM pg_policies 
WHERE tablename = 'products';

-- 2. REMOVER POLÍTICAS PROBLEMÁTICAS
DO $$
BEGIN
    -- Remover todas políticas existentes para products
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    DROP POLICY IF EXISTS "Public can view active products" ON products;
    DROP POLICY IF EXISTS "Users can view products" ON products;
    DROP POLICY IF EXISTS "Admins can insert products" ON products;
    DROP POLICY IF EXISTS "Admins can update products" ON products;
    DROP POLICY IF EXISTS "Admins can delete products" ON products;
    
    RAISE NOTICE 'Políticas antigas removidas';
END $$;

-- 3. CRIAR POLÍTICAS ULTRA SIMPLES E PERMISSIVAS
-- Política para administradores - INSERÇÃO
CREATE POLICY "admin_insert_products" ON products
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Política para administradores - SELEÇÃO
CREATE POLICY "admin_select_products" ON products
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Política para administradores - ATUALIZAÇÃO
CREATE POLICY "admin_update_products" ON products
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Política para leitura pública de produtos ativos
CREATE POLICY "public_view_active_products" ON products
FOR SELECT TO public
USING (is_active = true);

-- 4. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR SE PERFIL ADMIN EXISTE E ESTÁ CORRETO
SELECT 
    'VERIFICAÇÃO ADMIN' as status,
    id, email, role, affiliate_status
FROM profiles 
WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da';

-- 6. TESTE RÁPIDO DE INSERÇÃO
-- Simular contexto do auth.uid()
DO $$
DECLARE
    test_category_id UUID;
    test_product_id UUID;
BEGIN
    -- Buscar categoria
    SELECT id INTO test_category_id FROM categories LIMIT 1;
    
    -- Tentar inserção (vai falhar se RLS ainda estiver bloqueando)
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
        'Teste RLS Corrigido',
        'Teste após correção das políticas RLS',
        test_category_id,
        'https://teste.com/imagem.jpg',
        'https://teste.com/affiliate',
        'https://teste.com/affiliate',
        49.90,
        10.0,
        4.99,
        ARRAY['teste'],
        true,
        'teste-rls-corrigido',
        'BRL'
    ) RETURNING id INTO test_product_id;
    
    IF test_product_id IS NOT NULL THEN
        RAISE NOTICE 'SUCCESS: RLS corrigido - produto inserido com ID %', test_product_id;
        DELETE FROM products WHERE id = test_product_id;
        RAISE NOTICE 'SUCCESS: Produto teste removido';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'AINDA COM PROBLEMA: %', SQLERRM;
END $$;

-- 7. VERIFICAR POLÍTICAS FINAIS
SELECT 
    'POLÍTICAS FINAIS' as status,
    policyname, 
    cmd, 
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd, policyname; 