-- 🚨 CORREÇÃO URGENTE: RLS BLOQUEANDO INSERÇÃO DE PRODUTOS
-- Execute este script IMEDIATAMENTE no Supabase SQL Editor

-- 1. REMOVER TODAS POLÍTICAS CONFLITANTES
DO $$
BEGIN
    -- Remover políticas que podem estar conflitando
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    DROP POLICY IF EXISTS "Public can view active products" ON products;
    DROP POLICY IF EXISTS "Users can view products" ON products;
    DROP POLICY IF EXISTS "Admins can insert products" ON products;
    DROP POLICY IF EXISTS "Admins can update products" ON products;
    DROP POLICY IF EXISTS "Admins can delete products" ON products;
    DROP POLICY IF EXISTS "admin_insert_products" ON products;
    DROP POLICY IF EXISTS "admin_select_products" ON products;
    DROP POLICY IF EXISTS "admin_update_products" ON products;
    DROP POLICY IF EXISTS "public_view_active_products" ON products;
    DROP POLICY IF EXISTS "Enable read access for all users" ON products;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
    
    RAISE NOTICE 'Todas políticas removidas';
END $$;

-- 2. CRIAR POLÍTICAS ULTRA PERMISSIVAS PARA ADMIN
-- Inserção para admin (usuário específico)
CREATE POLICY "admin_can_insert_products" ON products
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = '99a703eb-9db2-48cd-affa-90fb4527c3da'::uuid
);

-- Seleção para admin
CREATE POLICY "admin_can_select_products" ON products
FOR SELECT TO authenticated
USING (
    auth.uid() = '99a703eb-9db2-48cd-affa-90fb4527c3da'::uuid
);

-- Atualização para admin
CREATE POLICY "admin_can_update_products" ON products
FOR UPDATE TO authenticated
USING (
    auth.uid() = '99a703eb-9db2-48cd-affa-90fb4527c3da'::uuid
);

-- Exclusão para admin
CREATE POLICY "admin_can_delete_products" ON products
FOR DELETE TO authenticated
USING (
    auth.uid() = '99a703eb-9db2-48cd-affa-90fb4527c3da'::uuid
);

-- Leitura pública para produtos ativos
CREATE POLICY "public_can_view_active_products" ON products
FOR SELECT TO public
USING (is_active = true);

-- 3. GARANTIR RLS HABILITADO
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR RESULTADO
SELECT 
    'POLÍTICAS CRIADAS' as status,
    policyname, 
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd, policyname;

-- 5. CONFIRMAR ADMIN
SELECT 
    'ADMIN CONFIRMADO' as status,
    id, email, role
FROM profiles 
WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da';

SELECT '✅ CORREÇÃO CONCLUÍDA - TESTE AGORA O CADASTRO DE PRODUTO' as resultado; 