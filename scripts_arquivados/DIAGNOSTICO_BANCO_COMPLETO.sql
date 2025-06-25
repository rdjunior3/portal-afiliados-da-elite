-- =============================================
-- DIAGNÓSTICO COMPLETO BANCO SUPABASE
-- Execute no SQL Editor do Dashboard
-- vhociemaoccrkpcylpit.supabase.co
-- =============================================

SELECT '🔍 INICIANDO DIAGNÓSTICO COMPLETO...' as status;

-- 1. VERIFICAR EXTENSÕES
SELECT '📋 EXTENSÕES' as secao;
SELECT name, installed_version, 
       CASE WHEN installed_version IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pg_trgm', 'pgcrypto')
ORDER BY name;

-- 2. LISTAR TODAS AS TABELAS
SELECT '📊 TABELAS' as secao;
SELECT table_name, 
       CASE WHEN table_name IN ('profiles', 'chat_rooms', 'products', 'categories') 
            THEN '🔥 CRÍTICA' ELSE '📄 OUTRAS' END as prioridade
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. VERIFICAR BUCKETS
SELECT '🪣 STORAGE BUCKETS' as secao;
SELECT id, name, public, file_size_limit,
       CASE WHEN id = 'product-images' THEN '🔥 CRÍTICO' ELSE '📄 OUTROS' END as prioridade
FROM storage.buckets 
ORDER BY id;

-- 4. VERIFICAR RLS POLICIES
SELECT '🔐 POLÍTICAS RLS' as secao;
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. VERIFICAR ENUMS
SELECT '📝 ENUMS' as secao;
SELECT t.typname as enum_name
FROM pg_type t 
WHERE t.typname IN ('user_role', 'affiliate_status', 'product_status')
ORDER BY t.typname;

-- 6. DIAGNÓSTICO ESPECÍFICO DOS PROBLEMAS
SELECT '🚨 DIAGNÓSTICO DOS ERROS' as secao;

DO $$
DECLARE
    has_profiles BOOLEAN := FALSE;
    has_chat_rooms BOOLEAN := FALSE; 
    has_products BOOLEAN := FALSE;
    has_bucket BOOLEAN := FALSE;
    has_elite_room BOOLEAN := FALSE;
    profile_count INTEGER := 0;
    admin_count INTEGER := 0;
BEGIN
    -- Verificar tabela profiles
    BEGIN
        SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') INTO has_profiles;
        IF has_profiles THEN
            SELECT COUNT(*) INTO profile_count FROM profiles;
            SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        has_profiles := FALSE;
    END;

    -- Verificar tabela chat_rooms
    BEGIN
        SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_rooms') INTO has_chat_rooms;
        IF has_chat_rooms THEN
            SELECT EXISTS(SELECT 1 FROM chat_rooms WHERE name = 'Comunidade da Elite') INTO has_elite_room;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        has_chat_rooms := FALSE;
    END;

    -- Verificar tabela products
    BEGIN
        SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'products') INTO has_products;
    EXCEPTION WHEN OTHERS THEN
        has_products := FALSE;
    END;

    -- Verificar bucket product-images
    BEGIN
        SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO has_bucket;
    EXCEPTION WHEN OTHERS THEN
        has_bucket := FALSE;
    END;

    -- RELATÓRIO DE PROBLEMAS
    RAISE NOTICE '====================================';
    RAISE NOTICE '🔍 ANÁLISE DOS PROBLEMAS REPORTADOS:';
    RAISE NOTICE '====================================';

    -- Problema 1: Erro 406/403 chat_rooms
    IF NOT has_chat_rooms THEN
        RAISE NOTICE '❌ PROBLEMA 1: Tabela chat_rooms NÃO EXISTE';
        RAISE NOTICE '   → Causa dos erros 406/403 no useInitialSetup';
        RAISE NOTICE '   → useInitialSetup tentando criar sala inexistente';
    ELSIF NOT has_elite_room THEN
        RAISE NOTICE '⚠️  PROBLEMA 1: Sala "Comunidade da Elite" MISSING';  
        RAISE NOTICE '   → Causa do loop infinito no useInitialSetup';
    ELSE
        RAISE NOTICE '✅ Chat rooms: OK (inclui Comunidade da Elite)';
    END IF;

    -- Problema 2: Upload de produtos falha
    IF NOT has_bucket THEN
        RAISE NOTICE '❌ PROBLEMA 2: Bucket product-images NÃO EXISTE';
        RAISE NOTICE '   → Causa da falha no upload de produtos';
        RAISE NOTICE '   → CreateProductModal.uploadImageToSupabase() falha';
    ELSE
        RAISE NOTICE '✅ Bucket product-images: OK';
    END IF;

    -- Problema 3: Estrutura geral
    IF NOT has_profiles THEN
        RAISE NOTICE '❌ PROBLEMA 3: Tabela profiles NÃO EXISTE';
        RAISE NOTICE '   → Projeto completamente vazio';
    ELSIF profile_count = 0 THEN
        RAISE NOTICE '⚠️  PROBLEMA 3: Tabela profiles vazia';
        RAISE NOTICE '   → Nenhum usuário cadastrado');
    ELSIF admin_count = 0 THEN
        RAISE NOTICE '⚠️  PROBLEMA 3: Nenhum admin configurado';
        RAISE NOTICE '   → Usuário 04junior.silva09@gmail.com precisa ser admin');
    ELSE
        RAISE NOTICE '✅ Profiles: % usuários (% admins)', profile_count, admin_count;
    END IF;

    RAISE NOTICE '====================================';

    -- DIAGNÓSTICO FINAL E RECOMENDAÇÕES
    IF NOT has_profiles AND NOT has_chat_rooms AND NOT has_bucket THEN
        RAISE NOTICE '🚨 DIAGNÓSTICO: PROJETO COMPLETAMENTE VAZIO';
        RAISE NOTICE '📋 SOLUÇÃO: Execute SOLUCAO_URGENTE_NOVO_PROJETO.sql';
        RAISE NOTICE '   → Irá criar estrutura completa em uma execução';
    ELSIF NOT has_chat_rooms THEN
        RAISE NOTICE '🚨 DIAGNÓSTICO: ESTRUTURA PARCIAL - CHAT MISSING';
        RAISE NOTICE '📋 SOLUÇÃO: Criar tabelas chat_rooms e messages';
    ELSIF NOT has_bucket THEN
        RAISE NOTICE '🚨 DIAGNÓSTICO: STORAGE INCOMPLETO';
        RAISE NOTICE '📋 SOLUÇÃO: Configurar bucket product-images no Storage';
    ELSE
        RAISE NOTICE '✅ DIAGNÓSTICO: ESTRUTURA BÁSICA OK';
        RAISE NOTICE '📋 VERIFICAR: Logs detalhados da aplicação');
    END IF;

    RAISE NOTICE '====================================';
END $$;

-- 7. VERIFICAÇÃO FINAL
SELECT '✅ DIAGNÓSTICO COMPLETO FINALIZADO' as resultado;

-- Mostrar contagem de tabelas críticas
SELECT 
    'RESUMO FINAL' as secao,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('profiles', 'chat_rooms', 'products', 'categories', 'messages')) as tabelas_criticas,
    (SELECT COUNT(*) FROM storage.buckets 
     WHERE id IN ('product-images', 'avatars')) as buckets_essenciais; 