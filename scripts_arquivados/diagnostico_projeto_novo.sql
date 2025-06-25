-- =============================================
-- DIAGNÓSTICO PROJETO SUPABASE NOVO
-- Execute no SQL Editor do Dashboard
-- =============================================

SELECT 'INÍCIO DO DIAGNÓSTICO' as status;

-- 1. VERIFICAR EXTENSÕES
SELECT 'Verificando extensões...' as status;
SELECT name, installed_version, default_version 
FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pg_trgm', 'pgcrypto')
ORDER BY name;

-- 2. VERIFICAR TABELAS
SELECT 'Verificando tabelas...' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'products', 'categories', 'chat_rooms', 
    'messages', 'affiliate_links', 'commissions', 
    'courses', 'lessons', 'notifications'
)
ORDER BY table_name;

-- 3. VERIFICAR BUCKETS DE STORAGE
SELECT 'Verificando buckets...' as status;
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id IN ('product-images', 'avatars', 'uploads', 'courses')
ORDER BY id;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 'Verificando políticas RLS...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. VERIFICAR FUNÇÕES
SELECT 'Verificando funções...' as status;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%affiliate%' OR routine_name LIKE '%product%'
ORDER BY routine_name;

-- 6. VERIFICAR ENUMS
SELECT 'Verificando enums...' as status;
SELECT t.typname as enum_name, e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_role', 'affiliate_status', 'product_status', 'commission_status')
ORDER BY t.typname, e.enumsortorder;

-- 7. RESUMO FINAL
SELECT 'RESUMO DO DIAGNÓSTICO' as status;

DO $$
DECLARE
    tables_count INTEGER;
    buckets_count INTEGER;
    policies_count INTEGER;
    functions_count INTEGER;
    enums_count INTEGER;
BEGIN
    -- Contar tabelas
    SELECT COUNT(*) INTO tables_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'products', 'categories', 'chat_rooms', 'messages');
    
    -- Contar buckets
    SELECT COUNT(*) INTO buckets_count 
    FROM storage.buckets 
    WHERE id IN ('product-images', 'avatars');
    
    -- Contar políticas
    SELECT COUNT(*) INTO policies_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Contar funções
    SELECT COUNT(*) INTO functions_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public';
    
    -- Contar enums
    SELECT COUNT(DISTINCT t.typname) INTO enums_count
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname IN ('user_role', 'affiliate_status', 'product_status');
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'RESULTADO DO DIAGNÓSTICO:';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Tabelas principais: %/10', tables_count;
    RAISE NOTICE 'Buckets de storage: %/4', buckets_count;
    RAISE NOTICE 'Políticas RLS: %', policies_count;
    RAISE NOTICE 'Funções customizadas: %', functions_count;
    RAISE NOTICE 'Enums: %/4', enums_count;
    RAISE NOTICE '====================================';
    
    IF tables_count = 0 THEN
        RAISE NOTICE '🚨 PROJETO VAZIO - Aplicar estrutura_ideal_supabase.sql';
    ELSIF tables_count < 10 THEN
        RAISE NOTICE '⚠️ ESTRUTURA INCOMPLETA - Verificar migrações';
    ELSE
        RAISE NOTICE '✅ ESTRUTURA APARENTEMENTE OK';
    END IF;
    
    IF buckets_count = 0 THEN
        RAISE NOTICE '🚨 BUCKETS MISSING - Configurar storage';
    END IF;
    
    RAISE NOTICE '====================================';
END $$;

SELECT 'DIAGNÓSTICO CONCLUÍDO' as status; 