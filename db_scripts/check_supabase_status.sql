-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DO STATUS DO SUPABASE
-- Portal Afiliados da Elite - Verificação Completa
-- Data: 2025-01-30
-- =====================================================

-- 1. VERIFICAR BUCKETS DE STORAGE
SELECT 
  '🪣 VERIFICAÇÃO DE BUCKETS' as secao,
  'Verificando buckets necessários para upload' as descricao;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') 
    THEN '✅ AVATARS - OK' 
    ELSE '❌ AVATARS - CRIAR' 
  END as bucket_avatars,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profiles') 
    THEN '✅ PROFILES - OK' 
    ELSE '❌ PROFILES - CRIAR' 
  END as bucket_profiles,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'products') 
    THEN '✅ PRODUCTS - OK' 
    ELSE '❌ PRODUCTS - CRIAR' 
  END as bucket_products;

-- 2. VERIFICAR TABELAS PRINCIPAIS
SELECT 
  '📋 VERIFICAÇÃO DE TABELAS' as secao,
  'Verificando se as tabelas principais existem' as descricao;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN '✅ PROFILES - OK' 
    ELSE '❌ PROFILES - CRIAR' 
  END as tabela_profiles,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') 
    THEN '✅ PRODUCTS - OK' 
    ELSE '❌ PRODUCTS - CRIAR' 
  END as tabela_products,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_links') 
    THEN '✅ AFFILIATE_LINKS - OK' 
    ELSE '❌ AFFILIATE_LINKS - CRIAR' 
  END as tabela_affiliate_links;

-- 3. VERIFICAR POLÍTICAS RLS PARA STORAGE
SELECT 
  '🔒 VERIFICAÇÃO DE POLÍTICAS RLS' as secao,
  'Verificando políticas de segurança para storage' as descricao;

SELECT 
  COUNT(CASE WHEN policyname LIKE '%avatars%' THEN 1 END) as politicas_avatars,
  COUNT(CASE WHEN policyname LIKE '%profiles%' THEN 1 END) as politicas_profiles,
  COUNT(*) as total_politicas_storage
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 4. VERIFICAR EXTENSÕES
SELECT 
  '🔧 VERIFICAÇÃO DE EXTENSÕES' as secao,
  'Verificando extensões necessárias' as descricao;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
    THEN '✅ UUID-OSSP - OK' 
    ELSE '❌ UUID-OSSP - INSTALAR' 
  END as ext_uuid,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
    THEN '✅ PGCRYPTO - OK' 
    ELSE '❌ PGCRYPTO - INSTALAR' 
  END as ext_pgcrypto;

-- 5. VERIFICAR TIPOS CUSTOMIZADOS (ENUMS)
SELECT 
  '📝 VERIFICAÇÃO DE TIPOS' as secao,
  'Verificando tipos customizados (enums)' as descricao;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') 
    THEN '✅ USER_ROLE - OK' 
    ELSE '❌ USER_ROLE - CRIAR' 
  END as enum_user_role,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_status') 
    THEN '✅ AFFILIATE_STATUS - OK' 
    ELSE '❌ AFFILIATE_STATUS - CRIAR' 
  END as enum_affiliate_status;

-- 6. VERIFICAR TRIGGERS DE UPDATED_AT
SELECT 
  '⚡ VERIFICAÇÃO DE TRIGGERS' as secao,
  'Verificando triggers de atualização automática' as descricao;

SELECT 
  COUNT(CASE WHEN trigger_name LIKE '%updated_at%' THEN 1 END) as triggers_updated_at,
  COUNT(*) as total_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 7. RESUMO FINAL
SELECT 
  '📊 RESUMO FINAL' as secao,
  'Status geral do Supabase' as descricao;

-- Contadores gerais
WITH status_counts AS (
  SELECT 
    (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('avatars', 'profiles', 'products')) as buckets_ok,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('profiles', 'products', 'affiliate_links')) as tabelas_ok,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') as politicas_ok
)
SELECT 
  CASE 
    WHEN buckets_ok >= 2 AND tabelas_ok >= 3 AND politicas_ok >= 4 
    THEN '🎉 SUPABASE CONFIGURADO CORRETAMENTE'
    WHEN buckets_ok >= 1 AND tabelas_ok >= 2 
    THEN '⚠️ SUPABASE PARCIALMENTE CONFIGURADO - EXECUTAR create_avatars_bucket.sql'
    ELSE '❌ SUPABASE PRECISA DE CONFIGURAÇÃO COMPLETA - EXECUTAR MIGRATIONS'
  END as status_geral,
  buckets_ok || '/3 buckets' as buckets_status,
  tabelas_ok || '/3 tabelas' as tabelas_status,
  politicas_ok || ' políticas' as politicas_status
FROM status_counts;

-- =====================================================
-- INSTRUÇÕES BASEADAS NO RESULTADO
-- =====================================================

-- Se aparecer "❌" em qualquer verificação acima:
-- 1. Execute create_avatars_bucket.sql primeiro
-- 2. Se tabelas estão faltando, execute as migrations em ordem
-- 3. Verifique logs de erro para identificar problemas específicos

-- Ordem de execução recomendada:
-- 1. create_avatars_bucket.sql (PRIORITÁRIO)
-- 2. supabase/migrations/20250130_001_setup_extensions.sql
-- 3. supabase/migrations/20250130_002_create_enums.sql
-- 4. supabase/migrations/20250130_003_update_profiles.sql
-- 5. Outras migrations conforme necessário 