-- =====================================================
-- CORREÇÃO CRÍTICA: Problemas Identificados na Análise
-- Data: 2025-01-30
-- Objetivo: Resolver todos os problemas críticos
-- =====================================================

-- 1. VERIFICAR E POPULAR TABELA CATEGORIES
SELECT 'VERIFICAÇÃO: Tabela categories' as info;

-- Verificar se existem categorias
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('✅ Existem ', COUNT(*), ' categorias')
        ELSE '❌ Tabela categories está VAZIA'
    END as status_categories
FROM categories;

-- Se não existir nenhuma categoria, criar categorias padrão
INSERT INTO categories (id, name, description, color, is_active, sort_order)
SELECT 
    gen_random_uuid(),
    category_name,
    category_description,
    category_color,
    true,
    category_order
FROM (
    VALUES 
        ('Cursos Online', 'Cursos e treinamentos digitais', '#3B82F6', 1),
        ('E-books', 'Livros digitais e materiais educativos', '#10B981', 2),
        ('Software', 'Ferramentas e aplicativos', '#8B5CF6', 3),
        ('Consultoria', 'Serviços de consultoria e mentoria', '#F59E0B', 4),
        ('Físicos', 'Produtos físicos e materiais', '#EF4444', 5),
        ('Assinaturas', 'Serviços de assinatura mensal/anual', '#06B6D4', 6)
) AS default_categories(category_name, category_description, category_color, category_order)
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

-- Verificar resultado
SELECT 
    'RESULTADO: Categorias após inserção' as info,
    COUNT(*) as total_categorias,
    string_agg(name, ', ' ORDER BY sort_order) as categorias_disponiveis
FROM categories
WHERE is_active = true;

-- 2. VERIFICAR RLS POLICIES NA TABELA PROFILES
SELECT 'VERIFICAÇÃO: RLS Policies na tabela profiles' as info;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN '✅ RLS habilitado'
        ELSE '❌ RLS desabilitado'
    END as status
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Verificar políticas existentes para profiles
SELECT 
    'POLÍTICAS PROFILES:' as categoria,
    policyname as politica,
    cmd as operacao,
    permissive as permissiva,
    roles as funcoes
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY cmd;

-- 3. VERIFICAR PERMISSÕES DO USUÁRIO ATUAL
SELECT 'VERIFICAÇÃO: Permissões do usuário atual' as info;

SELECT 
    id as user_id,
    email,
    role,
    affiliate_status,
    onboarding_completed_at,
    affiliate_code,
    created_at,
    updated_at,
    CASE 
        WHEN role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]) 
        THEN '✅ É ADMIN - Permissões completas'
        ELSE '⚠️ Não é admin - Permissões limitadas'
    END as status_permissoes
FROM profiles 
WHERE id = auth.uid();

-- 4. TESTE DE UPDATE NO PROFILE (simular updateProfile)
SELECT 'TESTE: Simulando updateProfile do AuthContext' as info;

-- Tentar atualizar perfil com dados de teste
UPDATE profiles 
SET 
    first_name = COALESCE(first_name, 'Teste'),
    last_name = COALESCE(last_name, 'Usuario'),
    updated_at = NOW()
WHERE id = auth.uid();

-- Verificar se a atualização funcionou
SELECT 
    CASE 
        WHEN updated_at > NOW() - INTERVAL '30 seconds' 
        THEN '✅ UPDATE funcionou - updated_at recente'
        ELSE '❌ UPDATE pode ter falhado - updated_at antigo'
    END as teste_update,
    updated_at,
    first_name,
    last_name
FROM profiles 
WHERE id = auth.uid();

-- 5. VERIFICAR STORAGE BUCKETS
SELECT 'VERIFICAÇÃO: Storage buckets' as info;

SELECT 
    id as bucket,
    public as publico,
    file_size_limit as limite_mb,
    allowed_mime_types as tipos_mime,
    created_at,
    CASE 
        WHEN public THEN '✅ Público'
        ELSE '❌ Privado'
    END as status_publico
FROM storage.buckets 
WHERE id IN ('products', 'avatars', 'courses', 'uploads')
ORDER BY id;

-- 6. VERIFICAR POLÍTICAS DE STORAGE INSERT
SELECT 'VERIFICAÇÃO: Políticas INSERT no storage' as info;

SELECT 
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%products%' THEN '🏪 PRODUCTS'
        WHEN qual LIKE '%avatars%' THEN '👤 AVATARS'
        WHEN qual LIKE '%courses%' THEN '📚 COURSES'
        WHEN qual LIKE '%uploads%' THEN '📁 UPLOADS'
        ELSE '❓ OUTROS'
    END as bucket_relacionado,
    roles as funcoes_permitidas
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND cmd = 'INSERT'
ORDER BY bucket_relacionado;

-- 7. CRIAR POLÍTICA MAIS PERMISSIVA PARA PROFILES (se necessário)
-- Esta política permite que usuários atualizem seus próprios perfis
DO $$
BEGIN
    -- Tentar criar política se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'users_can_update_own_profile'
    ) THEN
        CREATE POLICY "users_can_update_own_profile"
        ON profiles FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
        
        RAISE NOTICE 'Política "users_can_update_own_profile" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "users_can_update_own_profile" já existe';
    END IF;
END $$;

-- 8. GARANTIR QUE RLS ESTÁ HABILITADO EM PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. RESUMO FINAL DOS PROBLEMAS
SELECT 'RESUMO: Status dos problemas críticos' as categoria;

-- Status das categorias
SELECT 
    'Categorias' as problema,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ RESOLVIDO'
        ELSE '❌ AINDA PENDENTE'
    END as status
FROM categories WHERE is_active = true;

-- Status do usuário admin
SELECT 
    'Usuário Admin' as problema,
    CASE 
        WHEN role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]) 
        THEN '✅ RESOLVIDO'
        ELSE '❌ AINDA PENDENTE'
    END as status
FROM profiles WHERE id = auth.uid();

-- Status dos buckets
SELECT 
    'Buckets Públicos' as problema,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ RESOLVIDO'
        ELSE '❌ AINDA PENDENTE'
    END as status
FROM storage.buckets 
WHERE id IN ('products', 'avatars') AND public = true;

-- Status das políticas INSERT
SELECT 
    'Políticas INSERT' as problema,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ RESOLVIDO'
        ELSE '❌ AINDA PENDENTE'
    END as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND cmd = 'INSERT'
AND (qual LIKE '%products%' OR qual LIKE '%avatars%');

-- 10. INSTRUÇÕES FINAIS
SELECT '🎯 PRÓXIMOS PASSOS APÓS ESTE SCRIPT:' as instrucoes;

SELECT '1. Testar Complete Profile no aplicativo' as passo_1;
SELECT '2. Testar upload de imagem (avatar e produto)' as passo_2;
SELECT '3. Testar cadastro de produto com categorias' as passo_3;
SELECT '4. Verificar console F12 para erros JavaScript' as passo_4;
SELECT '5. Se problemas persistirem, verificar logs do Supabase' as passo_5; 