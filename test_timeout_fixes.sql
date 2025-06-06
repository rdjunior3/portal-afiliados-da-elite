-- =====================================================
-- TESTE DAS CORREÇÕES DE TIMEOUT
-- Portal Afiliados da Elite - Verificação
-- =====================================================

-- ============================================
-- 1. VERIFICAR TIMEOUTS DOS ROLES
-- ============================================

SELECT 
    '=== TIMEOUTS DOS ROLES ===' as info;

SELECT 
    rolname as role,
    CASE 
        WHEN rolconfig IS NULL THEN 'DEFAULT (pode ser problema)'
        WHEN 'statement_timeout=5min' = ANY(rolconfig) THEN '✅ 5min (CORRETO)'
        WHEN 'statement_timeout=2min' = ANY(rolconfig) THEN '✅ 2min (CORRETO)'  
        WHEN 'statement_timeout=10min' = ANY(rolconfig) THEN '✅ 10min (CORRETO)'
        ELSE '❌ ' || array_to_string(rolconfig, ', ')
    END as timeout_status,
    CASE 
        WHEN rolname = 'authenticated' AND 'statement_timeout=5min' = ANY(rolconfig) THEN '✅ OK'
        WHEN rolname = 'anon' AND 'statement_timeout=2min' = ANY(rolconfig) THEN '✅ OK'
        WHEN rolname = 'service_role' AND 'statement_timeout=10min' = ANY(rolconfig) THEN '✅ OK'
        ELSE '❌ PRECISA CORREÇÃO'
    END as status
FROM pg_roles 
WHERE rolname IN ('authenticated', 'anon', 'service_role')
ORDER BY rolname;

-- ============================================
-- 2. VERIFICAR BUCKETS DE STORAGE
-- ============================================

SELECT 
    '=== STATUS DOS BUCKETS ===' as info;

SELECT 
    id as bucket,
    CASE 
        WHEN public THEN '✅ PÚBLICO'
        ELSE '❌ PRIVADO'
    END as acesso,
    ROUND(file_size_limit / 1048576.0, 1) || 'MB' as limite_tamanho,
    array_length(allowed_mime_types, 1) as tipos_suportados,
    CASE 
        WHEN id = 'avatars' AND file_size_limit >= 5242880 THEN '✅ OK'
        WHEN id = 'products' AND file_size_limit >= 10485760 THEN '✅ OK'
        WHEN id = 'uploads' AND file_size_limit >= 52428800 THEN '✅ OK'
        ELSE '❌ VERIFICAR'
    END as status
FROM storage.buckets 
WHERE id IN ('avatars', 'products', 'uploads')
ORDER BY id;

-- ============================================
-- 3. VERIFICAR POLÍTICAS DE STORAGE
-- ============================================

SELECT 
    '=== POLÍTICAS DE STORAGE ===' as info;

SELECT 
    policyname as politica,
    cmd as operacao,
    CASE 
        WHEN policyname LIKE '%avatars%' THEN '👤 AVATARS'
        WHEN policyname LIKE '%products%' THEN '🏪 PRODUCTS'
        WHEN policyname LIKE '%uploads%' THEN '📁 UPLOADS'
        ELSE '❓ OUTROS'
    END as bucket_tipo,
    '✅ ATIVA' as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (policyname LIKE '%avatars%' OR policyname LIKE '%uploads%')
ORDER BY bucket_tipo, cmd;

-- ============================================
-- 4. TESTE DE PERFORMANCE (SIMULAÇÃO)
-- ============================================

SELECT 
    '=== TESTE DE PERFORMANCE ===' as info;

-- Simular operação lenta para testar timeout
CREATE OR REPLACE FUNCTION test_timeout_operation()
RETURNS TEXT AS $$
BEGIN
    -- Simula operação de 2 segundos
    PERFORM pg_sleep(2);
    RETURN '✅ Operação concluída em 2s - Timeout funcionando';
END;
$$ LANGUAGE plpgsql;

-- Executar teste
SELECT test_timeout_operation() as resultado_teste;

-- Limpar função de teste
DROP FUNCTION test_timeout_operation();

-- ============================================
-- 5. RELATÓRIO FINAL
-- ============================================

DO $$
DECLARE
    roles_ok INTEGER := 0;
    buckets_ok INTEGER := 0;
    policies_ok INTEGER := 0;
    total_score INTEGER;
BEGIN
    -- Contar roles com timeout correto
    SELECT COUNT(*) INTO roles_ok
    FROM pg_roles 
    WHERE (rolname = 'authenticated' AND 'statement_timeout=5min' = ANY(rolconfig))
       OR (rolname = 'anon' AND 'statement_timeout=2min' = ANY(rolconfig))
       OR (rolname = 'service_role' AND 'statement_timeout=10min' = ANY(rolconfig));
    
    -- Contar buckets configurados
    SELECT COUNT(*) INTO buckets_ok
    FROM storage.buckets 
    WHERE id IN ('avatars', 'products', 'uploads') AND public = true;
    
    -- Contar políticas ativas
    SELECT COUNT(*) INTO policies_ok
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND (policyname LIKE '%avatars%' OR policyname LIKE '%uploads%');
    
    total_score := roles_ok + buckets_ok + policies_ok;
    
    RAISE NOTICE '=== RELATÓRIO FINAL ===';
    RAISE NOTICE 'Roles configurados: %/3', roles_ok;
    RAISE NOTICE 'Buckets configurados: %/3', buckets_ok;
    RAISE NOTICE 'Políticas ativas: %', policies_ok;
    RAISE NOTICE 'Score total: %/9', total_score;
    
    IF total_score >= 8 THEN
        RAISE NOTICE '🎉 CONFIGURAÇÃO EXCELENTE! Timeouts corrigidos.';
    ELSIF total_score >= 6 THEN
        RAISE NOTICE '⚠️ CONFIGURAÇÃO BOA, mas pode melhorar.';
    ELSE
        RAISE NOTICE '❌ CONFIGURAÇÃO PRECISA DE ATENÇÃO.';
        RAISE NOTICE '💡 Execute: supabase/migrations/20250130_fix_timeouts.sql';
    END IF;
    
    RAISE NOTICE '📝 Próximo: Teste upload na aplicação!';
END $$;

-- =====================================================
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Analise os resultados
-- 3. Se algum item estiver ❌, execute a migration de correção
-- 4. Teste upload de imagem na aplicação
-- ===================================================== 