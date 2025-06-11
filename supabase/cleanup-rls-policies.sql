-- ============================================
-- LIMPEZA DE POLÍTICAS RLS CONFLITANTES
-- Execute no dashboard do Supabase para remover duplicatas
-- ============================================

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS DE PRODUCTS
-- ============================================

-- Manter apenas as políticas granulares novas
DROP POLICY IF EXISTS "Allow admin management on products" ON products;
DROP POLICY IF EXISTS "Allow authenticated read access on products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Authenticated users manage products" ON products;

-- ============================================
-- 2. REMOVER POLÍTICAS ANTIGAS DE PROFILES
-- ============================================

-- Manter apenas as políticas granulares novas
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;

-- ============================================
-- 3. ADICIONAR POLÍTICA DE INSERT PARA PROFILES (se necessário)
-- ============================================

-- Política para criação de perfis (necessária para novos usuários)
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- ============================================
-- 4. VERIFICAÇÃO FINAL DAS POLÍTICAS ATIVAS
-- ============================================

-- Listar políticas finais (deve mostrar apenas as granulares)
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN policyname LIKE '%hierarchical%' OR policyname LIKE '%role_based%' OR policyname LIKE '%admin_%' OR policyname LIKE '%superadmin_%' THEN '✅ GRANULAR'
        WHEN policyname LIKE '%insert_own%' THEN '✅ NECESSÁRIA'
        ELSE '⚠️ REVISAR'
    END as status
FROM pg_policies 
WHERE tablename IN ('profiles', 'products')
ORDER BY tablename, policyname;

-- ============================================
-- 5. RESUMO DO RESULTADO ESPERADO
-- ============================================

/*
POLÍTICAS FINAIS ESPERADAS:

PROFILES:
- profiles_hierarchical_view (SELECT) ✅
- profiles_hierarchical_update (UPDATE) ✅  
- profiles_insert_own (INSERT) ✅

PRODUCTS:
- products_role_based_view (SELECT) ✅
- products_admin_insert (INSERT) ✅
- products_admin_update (UPDATE) ✅
- products_superadmin_delete (DELETE) ✅

TOTAL: 7 políticas granulares funcionais
*/

-- Verificar se chegamos ao número correto
DO $$
DECLARE
    total_policies INTEGER;
    granular_policies INTEGER;
BEGIN
    -- Contar total de políticas
    SELECT COUNT(*) INTO total_policies 
    FROM pg_policies 
    WHERE tablename IN ('profiles', 'products');
    
    -- Contar políticas granulares
    SELECT COUNT(*) INTO granular_policies 
    FROM pg_policies 
    WHERE tablename IN ('profiles', 'products')
    AND (
        policyname LIKE '%hierarchical%' OR 
        policyname LIKE '%role_based%' OR 
        policyname LIKE '%admin_%' OR 
        policyname LIKE '%superadmin_%' OR
        policyname LIKE '%insert_own%'
    );
    
    RAISE NOTICE 'Total de políticas: %, Políticas granulares: %', total_policies, granular_policies;
    
    IF total_policies = granular_policies AND total_policies = 7 THEN
        RAISE NOTICE '🎉 SUCESSO! Apenas políticas granulares estão ativas.';
    ELSIF granular_policies = 7 AND total_policies > 7 THEN
        RAISE WARNING '⚠️ Políticas granulares OK, mas ainda há % políticas extras que podem causar conflitos.', (total_policies - granular_policies);
    ELSE
        RAISE WARNING '❌ Configuração incompleta. Verifique as políticas manualmente.';
    END IF;
END $$; 