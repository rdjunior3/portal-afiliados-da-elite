-- ============================================
-- POLÍTICAS RLS GRANULARES - VERSÃO CORRIGIDA
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
DROP POLICY IF EXISTS "profiles_granular_view" ON profiles;
DROP POLICY IF EXISTS "profiles_granular_update" ON profiles;

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
            ) THEN role != 'super_admin'
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
            -- Usuários comuns podem editar apenas seu próprio perfil
            ELSE id = auth.uid()
        END
    );

-- ============================================
-- 2. TRIGGER PARA PROTEGER ALTERAÇÃO DE ROLES
-- ============================================

-- Função para proteger alteração de roles
CREATE OR REPLACE FUNCTION protect_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o role está sendo alterado
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- Verificar se o usuário atual pode alterar roles
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        ) THEN
            -- Usuário comum tentando alterar role - manter o role original
            NEW.role := OLD.role;
            RAISE NOTICE 'Role change blocked: insufficient privileges';
        END IF;
        
        -- Admin não pode promover para super_admin
        IF EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        ) AND NEW.role = 'super_admin' THEN
            NEW.role := OLD.role;
            RAISE EXCEPTION 'Admin cannot promote to super_admin';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS protect_role_changes_trigger ON profiles;
CREATE TRIGGER protect_role_changes_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION protect_role_changes();

-- ============================================
-- 3. POLÍTICAS GRANULARES PARA PRODUCTS
-- ============================================

-- Remover políticas existentes de produtos
DROP POLICY IF EXISTS "Users can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "products_view_policy" ON products;
DROP POLICY IF EXISTS "products_granular_view" ON products;
DROP POLICY IF EXISTS "products_admin_manage" ON products;

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

-- Política para inserção de produtos (admin apenas)
CREATE POLICY "products_admin_insert" ON products
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- Política para atualização de produtos (admin apenas)
CREATE POLICY "products_admin_update" ON products
    FOR UPDATE TO authenticated
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

-- Política para exclusão de produtos (super admin apenas)
CREATE POLICY "products_superadmin_delete" ON products
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
        )
    );

-- ============================================
-- 4. POLÍTICAS PARA COURSES (se a tabela existir)
-- ============================================

-- Verificar se a tabela courses existe e aplicar RLS
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        -- Habilitar RLS
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "courses_view_policy" ON courses;
        DROP POLICY IF EXISTS "courses_manage_policy" ON courses;
        DROP POLICY IF EXISTS "courses_granular_view" ON courses;
        DROP POLICY IF EXISTS "courses_granular_manage" ON courses;
        
        -- Política para visualização de cursos
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
            
        RAISE NOTICE '✅ Políticas RLS para courses aplicadas';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela courses não encontrada, pulando configuração';
    END IF;
END $$;

-- ============================================
-- 5. FUNÇÕES AUXILIARES PARA VERIFICAÇÃO DE PERMISSÕES
-- ============================================

-- Função para verificar se usuário pode gerenciar conteúdo
CREATE OR REPLACE FUNCTION can_manage_content(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin', 'moderator')
        AND COALESCE(status, 'active') = 'active'
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
        AND COALESCE(status, 'active') = 'active'
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
    SELECT role, COALESCE(status, 'active') INTO user_role, user_status 
    FROM profiles 
    WHERE id = user_id;
    
    IF user_role IS NULL THEN
        RETURN 'none';
    END IF;
    
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
-- 6. ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- ============================================

-- Índices para otimizar consultas de RLS
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, COALESCE(status, 'active'));
CREATE INDEX IF NOT EXISTS idx_profiles_auth_role ON profiles(id, role) WHERE id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_products_status_active ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- ============================================
-- 7. VERIFICAÇÃO FINAL E TESTES
-- ============================================

-- Testar funções auxiliares
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- Testar função de nível de acesso
    SELECT get_user_access_level() INTO test_result;
    RAISE NOTICE 'Nível de acesso atual: %', COALESCE(test_result, 'none');
    
    -- Verificar políticas criadas
    IF (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname LIKE '%granular%') >= 2 THEN
        RAISE NOTICE '✅ Políticas RLS para profiles criadas com sucesso';
    ELSE
        RAISE WARNING '⚠️ Algumas políticas de profiles podem não ter sido criadas';
    END IF;
    
    IF (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname LIKE '%admin%') >= 3 THEN
        RAISE NOTICE '✅ Políticas RLS para products criadas com sucesso';
    ELSE
        RAISE WARNING '⚠️ Algumas políticas de products podem não ter sido criadas';
    END IF;
    
    RAISE NOTICE '🎉 Migração RLS granular aplicada com sucesso!';
END $$; 