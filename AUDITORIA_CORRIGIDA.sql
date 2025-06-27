-- ============================================================================
-- AUDITORIA SUPABASE CORRIGIDA - PORTAL AFILIADOS DA ELITE 2025
-- Versão que verifica existência antes de consultar tabelas storage
-- ============================================================================

-- 1. VERIFICAÇÃO INICIAL
SELECT 'INICIANDO AUDITORIA CORRIGIDA...' as status;

-- Verificar conexão
SELECT current_database() as database, current_user as user_connected;

-- 2. SCHEMAS DISPONÍVEIS
SELECT 'VERIFICANDO SCHEMAS...' as status;

SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- 3. TABELAS PÚBLICAS E RLS
SELECT 'VERIFICANDO TABELAS E RLS...' as status;

SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '? RLS ATIVO'
    ELSE '? RLS DESABILITADO'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY rowsecurity DESC, tablename;

-- 4. POLÍTICAS RLS
SELECT 'VERIFICANDO POLÍTICAS RLS...' as status;

SELECT 
  n.nspname as schema_name,
  c.relname as table_name,
  pol.polname as policy_name,
  pol.polcmd as command,
  CASE 
    WHEN pol.polqual::text LIKE '%(select auth.uid())%' THEN '? OTIMIZADO'
    WHEN pol.polqual::text LIKE '%auth.uid()%' THEN '?? PODE OTIMIZAR'
    ELSE '? SEM auth.uid()'
  END as auth_optimization
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY c.relname, pol.polname;

-- 5. ÍNDICES PARA RLS
SELECT 'VERIFICANDO ÍNDICES...' as status;

SELECT 
  t.relname as table_name,
  i.relname as index_name,
  a.attname as column_name
FROM pg_index ix
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE n.nspname = 'public'
  AND a.attname IN ('user_id', 'profile_id', 'id')
ORDER BY t.relname;

-- 6. EXTENSÕES
SELECT 'VERIFICANDO EXTENSÕES...' as status;

SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pg_trgm', 'uuid-ossp', 'pgcrypto', 'pgsodium');

-- 7. VERIFICAÇÃO CONDICIONAL DE STORAGE
SELECT 'VERIFICANDO STORAGE...' as status;

-- Verificar se schema storage existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') 
    THEN '? SCHEMA STORAGE EXISTE'
    ELSE '? SCHEMA STORAGE NÃO ENCONTRADO'
  END as storage_status;

-- 8. RESUMO FINAL
SELECT 'AUDITORIA CONCLUÍDA!' as status;

SELECT 
  '?? AUDITORIA SUPABASE CORRIGIDA' as titulo,
  current_timestamp as data_auditoria;
