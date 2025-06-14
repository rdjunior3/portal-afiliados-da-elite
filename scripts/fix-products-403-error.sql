-- ============================================
-- SCRIPT PARA CORRIGIR ERRO 403 EM PRODUCTS
-- Execute este script no Dashboard do Supabase > SQL Editor
-- ============================================

-- 1. DIAGNÓSTICO: Verificar políticas RLS atuais
SELECT 
    'DIAGNÓSTICO: Políticas RLS da tabela products' AS status;

SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- 2. DIAGNÓSTICO: Verificar role do usuário admin
SELECT 
    'DIAGNÓSTICO: Verificando perfil do usuário admin' AS status;

SELECT 
    id,
    email,
    role,
    is_admin,
    created_at
FROM profiles 
WHERE email ILIKE '%04junior%' OR role = 'admin'
ORDER BY created_at DESC;

-- 3. DIAGNÓSTICO: Verificar se RLS está habilitado
SELECT 
    'DIAGNÓSTICO: Status RLS da tabela products' AS status;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'products';

-- 4. DIAGNÓSTICO: Testar enum product_status
SELECT 
    'DIAGNÓSTICO: Valores permitidos no enum product_status' AS status;

SELECT 
    enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'product_status'
);

-- ============================================
-- CORREÇÃO: Limpar políticas conflitantes
-- ============================================

SELECT 'CORREÇÃO: Removendo políticas conflitantes...' AS status;

-- Remover todas as políticas existentes de products
DROP POLICY IF EXISTS "Users can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "products_view_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;
DROP POLICY IF EXISTS "products_role_based_view" ON products;
DROP POLICY IF EXISTS "products_admin_insert" ON products;
DROP POLICY IF EXISTS "products_admin_update" ON products;
DROP POLICY IF EXISTS "products_superadmin_delete" ON products;
DROP POLICY IF EXISTS "products_granular_view" ON products;
DROP POLICY IF EXISTS "products_admin_manage" ON products;
DROP POLICY IF EXISTS "admin_full_access_products" ON products;
DROP POLICY IF EXISTS "Allow admin management on products" ON products;
DROP POLICY IF EXISTS "Allow authenticated read access on products" ON products;

-- ============================================
-- CORREÇÃO: Criar políticas RLS corretas
-- ============================================

SELECT 'CORREÇÃO: Criando políticas RLS corretas...' AS status;

-- Política 1: Visualização para usuários autenticados
CREATE POLICY "products_authenticated_read" ON products
FOR SELECT TO authenticated
USING (
    CASE
        -- Admin/Super admin veem todos os produtos
        WHEN EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        ) THEN true
        -- Outros usuários veem apenas produtos ativos
        ELSE status = 'active'
    END
);

-- Política 2: Gerenciamento completo para admins
CREATE POLICY "products_admin_full_access" ON products
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- Política 3: Leitura pública para produtos ativos (se necessário)
CREATE POLICY "products_public_read" ON products
FOR SELECT TO public
USING (status = 'active');

-- ============================================
-- VERIFICAÇÃO: Testar as correções
-- ============================================

SELECT 'VERIFICAÇÃO: Listando políticas finais...' AS status;

SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- Teste de update (simulação do que o app está tentando fazer)
SELECT 'VERIFICAÇÃO: Testando update de produto...' AS status;

-- Este é um teste READ-ONLY para verificar se o usuário conseguiria fazer o update
SELECT 
    p.id,
    p.name,
    p.status,
    prof.email,
    prof.role,
    CASE 
        WHEN prof.role IN ('admin', 'super_admin') THEN 'PERMITIDO'
        ELSE 'NEGADO'
    END as update_permission
FROM products p
CROSS JOIN profiles prof
WHERE p.id = 'a95b825f-08ac-4872-ac92-2b163a310ace'
  AND prof.email ILIKE '%04junior%'
LIMIT 1;

SELECT 'SCRIPT EXECUTADO COM SUCESSO! Agora teste a operação no app.' AS status;