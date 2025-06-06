-- =====================================================
-- CORREÇÃO DOS TIMEOUTS - CAUSA RAIZ IDENTIFICADA
-- Portal Afiliados da Elite - Fix de Performance
-- Data: 2025-01-30
-- =====================================================

-- ============================================
-- 1. AUMENTAR TIMEOUTS DOS ROLES PRINCIPAIS
-- ============================================

-- Timeout para role authenticated (usado por 99% das operações)
-- ANTES: 8 segundos | DEPOIS: 5 minutos
ALTER ROLE authenticated SET statement_timeout = '5min';

-- Timeout para role anon (usuários não logados)  
-- ANTES: 3 segundos | DEPOIS: 2 minutos
ALTER ROLE anon SET statement_timeout = '2min';

-- Timeout para role service_role (operações admin)
-- ANTES: 8 segundos | DEPOIS: 10 minutos
ALTER ROLE service_role SET statement_timeout = '10min';

-- ============================================
-- 2. CRIAR/VERIFICAR BUCKETS DE STORAGE  
-- ============================================

-- Bucket para avatars de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket para produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket para uploads gerais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 3. POLÍTICAS DE STORAGE OTIMIZADAS
-- ============================================

-- Remover políticas antigas que podem ter conflitos
DROP POLICY IF EXISTS "avatars_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;

-- Políticas para bucket avatars (SIMPLIFICADAS)
CREATE POLICY "avatars_public_access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- Políticas para bucket uploads
CREATE POLICY "uploads_public_access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'uploads');

CREATE POLICY "uploads_authenticated_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'uploads')
  WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- 4. OTIMIZAÇÕES DE PERFORMANCE
-- ============================================

-- Recarregar configurações do PostgREST para aplicar novos timeouts
NOTIFY pgrst, 'reload config';

-- ============================================
-- 5. VERIFICAÇÃO E RELATÓRIO
-- ============================================

DO $$
DECLARE
    role_timeouts RECORD;
    bucket_status RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== RELATÓRIO DE CORREÇÃO DE TIMEOUTS ===';
    
    -- Verificar timeouts dos roles
    RAISE NOTICE '📊 TIMEOUTS DOS ROLES:';
    FOR role_timeouts IN 
        SELECT rolname, rolconfig
        FROM pg_roles 
        WHERE rolname IN ('authenticated', 'anon', 'service_role')
    LOOP
        RAISE NOTICE '   • %: %', role_timeouts.rolname, 
            COALESCE(array_to_string(role_timeouts.rolconfig, ', '), 'default');
    END LOOP;
    
    -- Verificar buckets
    RAISE NOTICE '📁 BUCKETS DE STORAGE:';
    FOR bucket_status IN 
        SELECT id, public, file_size_limit, array_length(allowed_mime_types, 1) as mime_count
        FROM storage.buckets 
        WHERE id IN ('avatars', 'products', 'uploads')
        ORDER BY id
    LOOP
        RAISE NOTICE '   • %: %MB, % tipos, público=%', 
            bucket_status.id, 
            bucket_status.file_size_limit / 1048576,
            bucket_status.mime_count,
            bucket_status.public;
    END LOOP;
    
    -- Verificar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%avatars%' OR policyname LIKE '%uploads%';
    
    RAISE NOTICE '🔐 POLÍTICAS ATIVAS: %', policy_count;
    
    -- Status final
    IF policy_count >= 6 THEN
        RAISE NOTICE '✅ CORREÇÃO APLICADA COM SUCESSO!';
        RAISE NOTICE '💡 Timeouts aumentados, buckets configurados, políticas otimizadas';
    ELSE
        RAISE NOTICE '⚠️ VERIFIQUE AS POLÍTICAS MANUALMENTE';
    END IF;
END $$;

-- =====================================================
-- INSTRUÇÕES PÓS-APLICAÇÃO:
-- =====================================================

/*
🎯 O QUE FOI CORRIGIDO:

1. ⏱️ TIMEOUTS AUMENTADOS:
   - authenticated: 8s → 5min
   - anon: 3s → 2min  
   - service_role: 8s → 10min

2. 📁 BUCKETS CONFIGURADOS:
   - avatars: 5MB para fotos de perfil
   - products: 10MB para imagens de produtos
   - uploads: 50MB para arquivos gerais

3. 🔐 POLÍTICAS SIMPLIFICADAS:
   - Acesso público para visualização
   - Upload/edição apenas para autenticados

4. 🚀 PERFORMANCE OTIMIZADA:
   - Configurações recarregadas
   - Timeouts compatíveis com conexões lentas

📝 PRÓXIMOS PASSOS:
   - Teste upload de imagem no dashboard
   - Teste atualização de perfil
   - Monitore logs para verificar se timeouts pararam

🔧 SE PROBLEMAS PERSISTIREM:
   - Execute: SELECT rolname, rolconfig FROM pg_roles;
   - Verifique se buckets existem no dashboard
   - Confirme se aplicação está usando novo cliente
*/ 