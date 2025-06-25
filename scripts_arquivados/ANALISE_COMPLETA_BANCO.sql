-- =============================================
-- ANÁLISE COMPLETA DO BANCO SUPABASE
-- Execute no SQL Editor do Dashboard
-- =============================================

SELECT '🔍 INICIANDO ANÁLISE COMPLETA DO BANCO...' as status;

-- =============================================
-- 1. VERIFICAR EXTENSÕES INSTALADAS
-- =============================================
SELECT '📋 1. EXTENSÕES INSTALADAS' as section;

SELECT 
    name as extensao,
    installed_version as versao_instalada,
    default_version as versao_padrao,
    CASE WHEN installed_version IS NOT NULL THEN '✅ Instalada' ELSE '❌ Não instalada' END as status
FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pg_trgm', 'pgcrypto', 'postgis')
ORDER BY name;

-- =============================================
-- 2. VERIFICAR TODAS AS TABELAS
-- =============================================
SELECT '📊 2. TABELAS NO BANCO' as section;

SELECT 
    table_name as tabela,
    table_type as tipo,
    CASE 
        WHEN table_name IN ('profiles', 'products', 'categories', 'chat_rooms', 'messages', 'affiliate_links', 'commissions', 'courses', 'lessons', 'notifications') 
        THEN '✅ Essencial'
        ELSE '📄 Outras'
    END as importancia
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY 
    CASE WHEN table_name IN ('profiles', 'products', 'categories', 'chat_rooms', 'messages') THEN 1 ELSE 2 END,
    table_name;

-- =============================================
-- 3. VERIFICAR COLUNAS DAS TABELAS PRINCIPAIS
-- =============================================
SELECT '🔧 3. ESTRUTURA DAS TABELAS PRINCIPAIS' as section;

SELECT 
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as permite_null,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'products', 'categories', 'chat_rooms', 'messages')
ORDER BY table_name, ordinal_position;

-- =============================================
-- 4. VERIFICAR BUCKETS DE STORAGE
-- =============================================
SELECT '🪣 4. BUCKETS DE STORAGE' as section;

SELECT 
    id as bucket_id,
    name as nome,
    public as publico,
    file_size_limit as limite_tamanho,
    allowed_mime_types as tipos_permitidos,
    CASE 
        WHEN id IN ('product-images', 'avatars', 'uploads') THEN '✅ Essencial'
        ELSE '📄 Outros'
    END as importancia
FROM storage.buckets 
ORDER BY 
    CASE WHEN id IN ('product-images', 'avatars') THEN 1 ELSE 2 END,
    id;

-- =============================================
-- 5. VERIFICAR POLÍTICAS RLS
-- =============================================
SELECT '🔐 5. POLÍTICAS RLS (ROW LEVEL SECURITY)' as section;

SELECT 
    schemaname as schema,
    tablename as tabela,
    policyname as politica,
    permissive as permissiva,
    roles as roles,
    cmd as comando,
    qual as condicao
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 6. VERIFICAR ENUMS CRIADOS
-- =============================================
SELECT '📝 6. ENUMS (TIPOS PERSONALIZADOS)' as section;

SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as valores_possiveis
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_role', 'affiliate_status', 'product_status', 'commission_status', 'notification_type')
GROUP BY t.typname
ORDER BY t.typname;

-- =============================================
-- 7. VERIFICAR FUNÇÕES CUSTOMIZADAS
-- =============================================
SELECT '⚙️ 7. FUNÇÕES CUSTOMIZADAS' as section;

SELECT 
    routine_name as funcao,
    routine_type as tipo,
    CASE 
        WHEN routine_name LIKE '%affiliate%' OR routine_name LIKE '%product%' THEN '✅ Negócio'
        WHEN routine_name LIKE '%update%' OR routine_name LIKE '%handle%' THEN '🔧 Sistema'
        ELSE '📄 Outras'
    END as categoria
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%'
ORDER BY 
    CASE 
        WHEN routine_name LIKE '%affiliate%' OR routine_name LIKE '%product%' THEN 1
        WHEN routine_name LIKE '%update%' OR routine_name LIKE '%handle%' THEN 2
        ELSE 3
    END,
    routine_name;

-- =============================================
-- 8. VERIFICAR TRIGGERS
-- =============================================
SELECT '🎯 8. TRIGGERS CONFIGURADOS' as section;

SELECT 
    trigger_name as trigger_nome,
    event_object_table as tabela,
    action_timing as momento,
    event_manipulation as evento
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =============================================
-- 9. VERIFICAR DADOS BÁSICOS
-- =============================================
SELECT '📈 9. CONTAGEM DE DADOS' as section;

DO $$
DECLARE
    sql_query TEXT;
    result_row RECORD;
    table_name TEXT;
    row_count INTEGER;
BEGIN
    -- Verificar dados nas tabelas principais
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name IN ('profiles', 'categories', 'products', 'chat_rooms', 'messages', 'affiliate_links', 'commissions')
    LOOP
        sql_query := 'SELECT COUNT(*) FROM ' || table_name;
        EXECUTE sql_query INTO row_count;
        RAISE NOTICE '% registros na tabela %', row_count, table_name;
    END LOOP;
END $$;

-- =============================================
-- 10. VERIFICAR PROBLEMAS ESPECÍFICOS
-- =============================================
SELECT '🚨 10. DIAGNÓSTICO DE PROBLEMAS' as section;

DO $$
DECLARE
    profiles_count INTEGER := 0;
    chat_rooms_count INTEGER := 0;
    categories_count INTEGER := 0;
    products_count INTEGER := 0;
    bucket_count INTEGER := 0;
    elite_room_count INTEGER := 0;
    admin_count INTEGER := 0;
    problems TEXT[] := ARRAY[]::TEXT[];
    recommendations TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Verificar se tabelas existem e têm dados
    BEGIN
        SELECT COUNT(*) INTO profiles_count FROM profiles;
    EXCEPTION WHEN OTHERS THEN
        profiles_count := -1;
        problems := array_append(problems, '❌ Tabela profiles não existe ou inacessível');
    END;
    
    BEGIN
        SELECT COUNT(*) INTO chat_rooms_count FROM chat_rooms;
    EXCEPTION WHEN OTHERS THEN
        chat_rooms_count := -1;
        problems := array_append(problems, '❌ Tabela chat_rooms não existe (causa erro 406/403)');
    END;
    
    BEGIN
        SELECT COUNT(*) INTO categories_count FROM categories;
    EXCEPTION WHEN OTHERS THEN
        categories_count := -1;
        problems := array_append(problems, '❌ Tabela categories não existe');
    END;
    
    BEGIN
        SELECT COUNT(*) INTO products_count FROM products;
    EXCEPTION WHEN OTHERS THEN
        products_count := -1;
        problems := array_append(problems, '❌ Tabela products não existe');
    END;
    
    -- Verificar buckets
    BEGIN
        SELECT COUNT(*) INTO bucket_count FROM storage.buckets WHERE id = 'product-images';
    EXCEPTION WHEN OTHERS THEN
        bucket_count := 0;
    END;
    
    -- Verificar sala "Comunidade da Elite"
    IF chat_rooms_count >= 0 THEN
        SELECT COUNT(*) INTO elite_room_count FROM chat_rooms WHERE name = 'Comunidade da Elite';
    END IF;
    
    -- Verificar admins
    IF profiles_count >= 0 THEN
        BEGIN
            SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
        EXCEPTION WHEN OTHERS THEN
            admin_count := 0;
        END;
    END IF;
    
    -- Análise dos problemas
    RAISE NOTICE '====================================';
    RAISE NOTICE '📊 RESULTADO DA ANÁLISE:';
    RAISE NOTICE '====================================';
    
    IF profiles_count = -1 THEN
        RAISE NOTICE '🚨 PROJETO COMPLETAMENTE VAZIO';
        recommendations := array_append(recommendations, 'Execute SOLUCAO_URGENTE_NOVO_PROJETO.sql');
    ELSE
        RAISE NOTICE '✅ Tabela profiles: % registros', profiles_count;
        IF admin_count = 0 THEN
            problems := array_append(problems, '⚠️ Nenhum usuário admin encontrado');
        END IF;
    END IF;
    
    IF chat_rooms_count = -1 THEN
        RAISE NOTICE '❌ Tabela chat_rooms: NÃO EXISTE (causa 406/403)';
        recommendations := array_append(recommendations, 'Criar tabela chat_rooms para resolver erros de chat');
    ELSIF elite_room_count = 0 THEN
        RAISE NOTICE '⚠️ Sala "Comunidade da Elite": NÃO EXISTE (causa loop infinito)';
        recommendations := array_append(recommendations, 'Criar sala "Comunidade da Elite"');
    ELSE
        RAISE NOTICE '✅ Chat rooms: % salas (inclui Comunidade da Elite)', chat_rooms_count;
    END IF;
    
    IF bucket_count = 0 THEN
        RAISE NOTICE '❌ Bucket product-images: NÃO EXISTE (falha upload produtos)';
        recommendations := array_append(recommendations, 'Criar bucket product-images no Storage');
    ELSE
        RAISE NOTICE '✅ Bucket product-images: EXISTE';
    END IF;
    
    RAISE NOTICE '====================================';
    
    -- Mostrar problemas encontrados
    IF array_length(problems, 1) > 0 THEN
        RAISE NOTICE '🚨 PROBLEMAS ENCONTRADOS:';
        FOR i IN 1..array_length(problems, 1) LOOP
            RAISE NOTICE '%', problems[i];
        END LOOP;
    END IF;
    
    -- Mostrar recomendações
    IF array_length(recommendations, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '💡 RECOMENDAÇÕES:';
        FOR i IN 1..array_length(recommendations, 1) LOOP
            RAISE NOTICE '% %', i, recommendations[i];
        END LOOP;
    END IF;
    
    RAISE NOTICE '====================================';
    
    -- Diagnóstico final
    IF profiles_count = -1 AND chat_rooms_count = -1 THEN
        RAISE NOTICE '🎯 DIAGNÓSTICO: PROJETO NOVO - ESTRUTURA COMPLETA NECESSÁRIA';
        RAISE NOTICE '📋 AÇÃO: Execute SOLUCAO_URGENTE_NOVO_PROJETO.sql';
    ELSIF chat_rooms_count = -1 THEN
        RAISE NOTICE '🎯 DIAGNÓSTICO: ESTRUTURA PARCIAL - CHAT_ROOMS MISSING';
        RAISE NOTICE '📋 AÇÃO: Criar tabelas de chat e configurar RLS';
    ELSIF bucket_count = 0 THEN
        RAISE NOTICE '🎯 DIAGNÓSTICO: STORAGE INCOMPLETO';
        RAISE NOTICE '📋 AÇÃO: Configurar buckets de storage';
    ELSE
        RAISE NOTICE '🎯 DIAGNÓSTICO: ESTRUTURA APARENTEMENTE OK';
        RAISE NOTICE '📋 VERIFICAR: Logs da aplicação para outros problemas';
    END IF;
    
END $$;

SELECT '✅ ANÁLISE COMPLETA FINALIZADA' as status; 