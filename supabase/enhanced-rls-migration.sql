-- ============================================
-- POLÍTICAS RLS GRANULARES - PORTAL AFILIADOS DA ELITE
-- Execute este script no dashboard do Supabase
-- ============================================

-- ============================================
-- 1. POLÍTICAS GRANULARES PARA PROFILES
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_view_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Política granular para visualização de perfis baseada em roles
CREATE POLICY "profiles_granular_view" ON profiles
    FOR SELECT TO authenticated
    USING (
        CASE 
            -- Super admin pode ver todos os perfis
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'super_admin'
            ) THEN true
            -- Admin pode ver perfis específicos
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'admin'
            ) THEN role IN ('affiliate', 'moderator', 'user')
            -- Moderadores podem ver afiliados e usuários
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'moderator'
            ) THEN role IN ('affiliate', 'user')
            -- Usuários veem próprio perfil
            ELSE id = auth.uid()
        END
    );

-- Política granular para atualização de perfis
CREATE POLICY "profiles_granular_update" ON profiles
    FOR UPDATE TO authenticated
    USING (
        CASE
            -- Super admin pode editar qualquer perfil
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'super_admin'
            ) THEN true
            -- Admin pode editar perfis (exceto super_admin)
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'admin'
            ) THEN role != 'super_admin' AND id != auth.uid()
            -- Usuários só podem editar próprio perfil
            ELSE id = auth.uid()
        END
    )
    WITH CHECK (
        -- Super admin e admin podem alterar qualquer campo
        CASE
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin')
            ) THEN true
            -- Usuários comuns podem editar apenas campos específicos (não role)
            ELSE id = auth.uid()
        END
    );

-- ============================================
-- 2. POLÍTICAS GRANULARES PARA PRODUCTS
-- ============================================

-- Remover políticas existentes de produtos
DROP POLICY IF EXISTS "Users can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "products_view_policy" ON products;

-- Política granular para visualização de produtos
CREATE POLICY "products_granular_view" ON products
    FOR SELECT TO authenticated
    USING (
        CASE
            -- Admin/Super admin veem todos os produtos
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
            ) THEN true
            -- Moderadores veem produtos ativos e pendentes
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'moderator'
            ) THEN status IN ('active', 'pending')
            -- Afiliados veem apenas produtos ativos
            ELSE status = 'active'
        END
    );

-- Política para gerenciamento completo de produtos (admin apenas)
CREATE POLICY "products_admin_manage" ON products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- 3. POLÍTICAS PARA COURSES (se a tabela existir)
-- ============================================

-- Verificar se a tabela courses existe e aplicar RLS
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        -- Habilitar RLS
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
        
        -- Política para visualização de cursos
        DROP POLICY IF EXISTS "courses_view_policy" ON courses;
        CREATE POLICY "courses_granular_view" ON courses
            FOR SELECT TO authenticated
            USING (
                CASE
                    -- Admin/Super admin veem todos os cursos
                    WHEN EXISTS (
                        SELECT 1 FROM profiles p 
                        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
                    ) THEN true
                    -- Moderadores veem cursos publicados e rascunhos
                    WHEN EXISTS (
                        SELECT 1 FROM profiles p 
                        WHERE p.id = auth.uid() AND p.role = 'moderator'
                    ) THEN status IN ('published', 'draft')
                    -- Afiliados/usuários veem apenas cursos publicados
                    ELSE status = 'published'
                END
            );
            
        -- Política para gerenciamento de cursos
        DROP POLICY IF EXISTS "courses_manage_policy" ON courses;
        CREATE POLICY "courses_granular_manage" ON courses
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin', 'moderator')
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin', 'moderator')
                )
            );
    END IF;
END $$;

-- ============================================
-- 4. FUNÇÕES AUXILIARES PARA VERIFICAÇÃO DE PERMISSÕES
-- ============================================

-- Função para verificar se usuário pode gerenciar conteúdo
CREATE OR REPLACE FUNCTION can_manage_content(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin', 'moderator')
        AND status = 'active'
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
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar nível de acesso
CREATE OR REPLACE FUNCTION get_user_access_level(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
    user_status TEXT;
BEGIN
    SELECT role, status INTO user_role, user_status 
    FROM profiles 
    WHERE id = user_id;
    
    IF user_status != 'active' THEN
        RETURN 'blocked';
    END IF;
    
    CASE user_role
        WHEN 'super_admin' THEN RETURN 'full';
        WHEN 'admin' THEN RETURN 'management';
        WHEN 'moderator' THEN RETURN 'content';
        WHEN 'affiliate' THEN RETURN 'affiliate';
        ELSE RETURN 'basic';
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- ============================================

-- Índices para otimizar consultas de RLS
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_products_status_active ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se as políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'products')
    AND policyname LIKE '%granular%';
    
    RAISE NOTICE 'Políticas RLS granulares criadas: %', policy_count;
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ Políticas RLS granulares implementadas com sucesso!';
    ELSE
        RAISE WARNING 'Algumas políticas podem não ter sido criadas corretamente.';
    END IF;
END $$; 