-- ============================================================================
-- AUDITORIA SUPABASE CORRIGIDA - PORTAL AFILIADOS DA ELITE 2025
-- Versão que NÃO depende de storage.policies (resolvendo erro 42P01)
-- ============================================================================

-- 1. VERIFICAÇÃO INICIAL
SELECT '🔍 INICIANDO AUDITORIA CORRIGIDA...' as status;

-- Verificar conexão atual
SELECT 
  current_database() as database_name, 
  current_user as connected_user;

-- 2. VERIFICAR SCHEMAS DISPONÍVEIS
SELECT '📋 VERIFICANDO SCHEMAS DISPONÍVEIS...' as status;

SELECT schema_name
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- 3. TABELAS PÚBLICAS E STATUS RLS
SELECT '🛡️ VERIFICANDO TABELAS E RLS...' as status;

SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY rowsecurity DESC, tablename;

-- 4. POLÍTICAS RLS E OTIMIZAÇÕES
SELECT '⚙️ ANALISANDO POLÍTICAS RLS...' as status;

SELECT 
  c.relname as table_name,
  pol.polname as policy_name,
  pol.polcmd as operation,
  CASE 
    WHEN pol.polqual::text LIKE '%(select auth.uid())%' THEN '✅ OTIMIZADO'
    WHEN pol.polqual::text LIKE '%auth.uid()%' THEN '⚠️ PODE SER OTIMIZADO'
    ELSE '❌ SEM auth.uid()'
  END as optimization_status
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY c.relname, pol.polname;

-- 5. EXTENSÕES INSTALADAS
SELECT '🔧 VERIFICANDO EXTENSÕES...' as status;

SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pg_trgm', 'uuid-ossp', 'pgcrypto', 'pgsodium')
ORDER BY extname;

-- 6. VERIFICAÇÃO SEGURA DE STORAGE
SELECT '📁 VERIFICANDO STORAGE (SEGURO)...' as status;

-- Verificar se schema storage existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') 
    THEN '✅ SCHEMA STORAGE EXISTE'
    ELSE '❌ SCHEMA STORAGE NÃO ENCONTRADO'
  END as storage_schema_status;

-- 7. CONTAGEM DE DADOS
SELECT '📊 VERIFICANDO DADOS...' as status;

-- Verificar tabelas principais
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END as table_exists
FROM (VALUES 
  ('profiles'),
  ('products'), 
  ('categories'),
  ('chat_rooms'),
  ('messages')
) AS expected_tables(table_name)
ORDER BY table_name;

-- 8. RESUMO FINAL
SELECT '✅ AUDITORIA CONCLUÍDA!' as status;

SELECT 
  '🎯 AUDITORIA SUPABASE CORRIGIDA' as titulo,
  current_timestamp as data_auditoria,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tabelas,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tabelas_com_rls;
