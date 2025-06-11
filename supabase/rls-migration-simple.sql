-- ============================================
-- POLÍTICAS RLS GRANULARES - VERSÃO SIMPLIFICADA
-- Execute este script no dashboard do Supabase
-- ============================================

-- ============================================
-- 1. LIMPAR POLÍTICAS EXISTENTES
-- ============================================

-- Remover todas as políticas existentes para recriação
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- ============================================
-- 2. POLÍTICAS GRANULARES PARA PROFILES
-- ============================================

-- Visualização de perfis baseada em hierarquia
CREATE POLICY "profiles_hierarchical_view" ON profiles
    FOR SELECT TO authenticated
    USING (
        -- Usuário pode ver próprio perfil
        id = auth.uid() 
        OR
        -- Super admin vê todos
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
        OR
        -- Admin vê afiliados, moderadores e usuários
        (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
            AND role IN ('affiliate', 'moderator', 'user')
        )
        OR
        -- Moderador vê afiliados e usuários
        (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'moderator'
            )
            AND role IN ('affiliate', 'user')
        )
    );

-- Atualização de perfis
CREATE POLICY "profiles_hierarchical_update" ON profiles
    FOR UPDATE TO authenticated
    USING (
        -- Usuário pode editar próprio perfil
        id = auth.uid() 
        OR
        -- Super admin pode editar qualquer perfil
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
        OR
        -- Admin pode editar perfis (exceto super_admin)
        (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
            AND role != 'super_admin'
        )
    );

-- ============================================
-- 3. POLÍTICAS GRANULARES PARA PRODUCTS
-- ============================================

-- Visualização de produtos por role
CREATE POLICY "products_role_based_view" ON products
    FOR SELECT TO authenticated
    USING (
        -- Admin/Super admin veem todos os produtos
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
        OR
        -- Moderadores veem produtos ativos e pendentes
        (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'moderator'
            )
            AND status IN ('active', 'pending')
        )
        OR
        -- Outros veem apenas produtos ativos
        status = 'active'
    );

-- Criação de produtos (apenas admin)
CREATE POLICY "products_admin_insert" ON products
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Atualização de produtos (apenas admin)
CREATE POLICY "products_admin_update" ON products
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Exclusão de produtos (apenas super admin)
CREATE POLICY "products_superadmin_delete" ON products
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================
-- 4. FUNÇÕES AUXILIARES
-- ============================================

-- Função para verificar se usuário pode gerenciar conteúdo
CREATE OR REPLACE FUNCTION can_manage_content(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é afiliado ativo
CREATE OR REPLACE FUNCTION is_active_affiliate(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('affiliate', 'moderator', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para otimizar consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_role_lookup ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON profiles(id) WHERE id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_products_status_lookup ON products(status);

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se as políticas foram criadas
DO $$
DECLARE
    profiles_policies INTEGER;
    products_policies INTEGER;
BEGIN
    -- Contar políticas criadas
    SELECT COUNT(*) INTO profiles_policies 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO products_policies 
    FROM pg_policies 
    WHERE tablename = 'products' AND schemaname = 'public';
    
    RAISE NOTICE 'Políticas profiles: %, Políticas products: %', profiles_policies, products_policies;
    
    IF profiles_policies >= 2 AND products_policies >= 4 THEN
        RAISE NOTICE '✅ Políticas RLS aplicadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Algumas políticas podem não ter sido criadas corretamente';
    END IF;
END $$; 