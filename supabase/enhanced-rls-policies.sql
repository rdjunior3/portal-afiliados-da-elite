-- ============================================
-- POLÍTICAS RLS GRANULARES - PORTAL AFILIADOS DA ELITE
-- ============================================

-- ============================================
-- 1. POLÍTICAS PARA PROFILES (Granulares por Role)
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

-- Política granular para visualização de perfis
CREATE POLICY "profiles_view_policy" ON profiles
    FOR SELECT TO authenticated
    USING (
        CASE 
            -- Super admin pode ver todos os perfis
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'super_admin'
            ) THEN true
            -- Admin pode ver perfis de afiliados e moderadores
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'admin'
            ) THEN role IN ('affiliate', 'moderator', 'user', 'admin')
            -- Moderadores podem ver perfis de afiliados e usuários
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'moderator'
            ) THEN role IN ('affiliate', 'user', 'moderator')
            -- Usuários podem ver próprio perfil e perfis públicos
            ELSE id = auth.uid() OR is_public = true
        END
    );

-- Política granular para atualização de perfis
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE TO authenticated
    USING (
        CASE
            -- Super admin pode editar qualquer perfil
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'super_admin'
            ) THEN true
            -- Admin pode editar perfis exceto super_admin
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'admin'
            ) THEN role != 'super_admin'
            -- Usuários só podem editar próprio perfil
            ELSE id = auth.uid()
        END
    )
    WITH CHECK (
        CASE
            -- Super admin pode promover para qualquer role
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'super_admin'
            ) THEN true
            -- Admin não pode promover para super_admin
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'admin'
            ) THEN role != 'super_admin'
            -- Usuários comuns não podem alterar próprio role
            ELSE (id = auth.uid() AND role = OLD.role)
        END
    );

-- ============================================
-- 2. POLÍTICAS PARA PRODUCTS (Granulares por Status e Role)
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Política granular para visualização de produtos
CREATE POLICY "products_view_policy" ON products
    FOR SELECT TO authenticated
    USING (
        CASE
            -- Admin/Super admin podem ver todos os produtos
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
            ) THEN true
            -- Moderadores podem ver produtos ativos e pendentes
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'moderator'
            ) THEN status IN ('active', 'pending')
            -- Afiliados podem ver apenas produtos ativos
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'affiliate'
            ) THEN status = 'active'
            -- Usuários comuns veem produtos ativos e em destaque
            ELSE status = 'active' AND (is_featured = true OR created_at > NOW() - INTERVAL '30 days')
        END
    );

-- Política para inserção de produtos
CREATE POLICY "products_insert_policy" ON products
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- Política granular para atualização de produtos
CREATE POLICY "products_update_policy" ON products
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

-- Política para exclusão de produtos
CREATE POLICY "products_delete_policy" ON products
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
        )
    );

-- ============================================
-- 3. POLÍTICAS PARA AFFILIATE_LINKS (Granulares por Proprietário)
-- ============================================

-- Habilitar RLS se não estiver
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Política para visualização de links de afiliados
CREATE POLICY "affiliate_links_view_policy" ON affiliate_links
    FOR SELECT TO authenticated
    USING (
        CASE
            -- Admin/Super admin podem ver todos os links
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
            ) THEN true
            -- Moderadores podem ver links ativos
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role = 'moderator'
            ) THEN is_active = true
            -- Usuários veem apenas próprios links
            ELSE user_id = auth.uid()
        END
    );

-- Política para criação de links
CREATE POLICY "affiliate_links_insert_policy" ON affiliate_links
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('affiliate', 'moderator', 'admin', 'super_admin')
        )
    );

-- Política para atualização de links
CREATE POLICY "affiliate_links_update_policy" ON affiliate_links
    FOR UPDATE TO authenticated
    USING (
        CASE
            -- Admin pode editar qualquer link
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
            ) THEN true
            -- Usuários editam apenas próprios links
            ELSE user_id = auth.uid()
        END
    );

-- ============================================
-- 4. POLÍTICAS PARA COMMISSIONS (Granulares por Proprietário)
-- ============================================

-- Habilitar RLS se não estiver
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Política para visualização de comissões
CREATE POLICY "commissions_view_policy" ON commissions
    FOR SELECT TO authenticated
    USING (
        CASE
            -- Admin/Super admin podem ver todas as comissões
            WHEN EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
            ) THEN true
            -- Usuários veem apenas próprias comissões
            ELSE affiliate_id = auth.uid()
        END
    );

-- Política para criação de comissões (apenas sistema)
CREATE POLICY "commissions_insert_policy" ON commissions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- 5. POLÍTICAS PARA COURSES (Controle de Acesso a Conteúdo)
-- ============================================

-- Habilitar RLS se não estiver
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Política para visualização de cursos
CREATE POLICY "courses_view_policy" ON courses
    FOR SELECT TO authenticated
    USING (
        CASE
            -- Admin/Super admin podem ver todos os cursos
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
CREATE POLICY "courses_manage_policy" ON courses
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

-- ============================================
-- 6. POLÍTICAS PARA STORAGE (Granulares por Tipo de Arquivo)
-- ============================================

-- Política granular para avatars
DROP POLICY IF EXISTS "Public access to profile avatars" ON storage.objects;
CREATE POLICY "avatars_access_policy" ON storage.objects
    FOR SELECT TO public
    USING (
        bucket_id = 'avatars' OR
        (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'avatars')
    );

-- Política granular para upload de avatars
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "avatars_upload_policy" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        (bucket_id = 'avatars' OR bucket_id = 'profiles') AND
        (storage.foldername(name))[1] = 'avatars' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Política granular para produtos
CREATE POLICY "product_images_view_policy" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'product-images');

-- Política para upload de imagens de produtos
CREATE POLICY "product_images_upload_policy" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' AND
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- 7. FUNÇÕES AUXILIARES PARA VERIFICAÇÃO DE PERMISSÕES
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
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar nível de acesso
CREATE OR REPLACE FUNCTION get_access_level(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = user_id;
    
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
-- 8. ÍNDICES PARA PERFORMANCE DAS POLÍTICAS RLS
-- ============================================

-- Índices para otimizar consultas de RLS
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_products_status_featured ON products(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user_active ON affiliate_links(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- ============================================
-- 9. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se todas as políticas foram criadas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'products', 'affiliate_links', 'commissions', 'courses');
    
    RAISE NOTICE 'Total de políticas RLS criadas: %', policy_count;
    
    IF policy_count < 10 THEN
        RAISE WARNING 'Número baixo de políticas RLS. Verifique se todas foram criadas corretamente.';
    ELSE
        RAISE NOTICE '✅ Políticas RLS granulares implementadas com sucesso!';
    END IF;
END $$; 