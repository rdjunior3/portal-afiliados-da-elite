-- ====================================================================
-- SCRIPT PARA CORREÇÃO DO STORAGE BUCKET - PROFILES
-- Portal Afiliados da Elite - Correção do Upload de Avatares
-- Data: 04/06/2025
-- ====================================================================

-- ============================================
-- 1. VERIFICAR E CRIAR BUCKET PROFILES
-- ============================================

-- Primeiro, vamos verificar se o bucket existe
DO $$
DECLARE
    bucket_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM storage.buckets 
        WHERE id = 'profiles'
    ) INTO bucket_exists;
    
    IF bucket_exists THEN
        RAISE NOTICE '✅ Bucket profiles já existe';
    ELSE
        RAISE NOTICE '❌ Bucket profiles não encontrado - será criado';
    END IF;
END $$;

-- Criar ou atualizar bucket profiles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profiles', 
  'profiles', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. VERIFICAR RLS E CRIAR POLÍTICAS
-- ============================================

-- Verificar se RLS está habilitado para storage.objects
DO $$
BEGIN
    -- Verificar RLS
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')) THEN
        RAISE NOTICE 'RLS não habilitado para storage.objects - isso é normal, o Supabase gerencia isso';
    ELSE
        RAISE NOTICE '✅ RLS habilitado para storage.objects';
    END IF;
END $$;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public access to profile avatars" ON storage.objects;

-- Criar políticas mais simples e funcionais
CREATE POLICY "profiles_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profiles');

CREATE POLICY "profiles_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'avatars');

CREATE POLICY "profiles_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'avatars');

CREATE POLICY "profiles_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profiles');

-- ============================================
-- 3. CRIAR BUCKET ALTERNATIVO CASO NECESSÁRIO
-- ============================================

-- Criar bucket 'avatars' como fallback
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas para bucket avatars
CREATE POLICY "avatars_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- ============================================
-- 4. VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar buckets criados
DO $$
DECLARE
    profiles_exists boolean;
    avatars_exists boolean;
    rec RECORD;
BEGIN
    SELECT EXISTS (SELECT FROM storage.buckets WHERE id = 'profiles') INTO profiles_exists;
    SELECT EXISTS (SELECT FROM storage.buckets WHERE id = 'avatars') INTO avatars_exists;
    
    RAISE NOTICE '=== RELATÓRIO DE BUCKETS ===';
    RAISE NOTICE 'Bucket profiles: %', CASE WHEN profiles_exists THEN '✅ Criado' ELSE '❌ Não encontrado' END;
    RAISE NOTICE 'Bucket avatars: %', CASE WHEN avatars_exists THEN '✅ Criado' ELSE '❌ Não encontrado' END;
    
    -- Listar políticas ativas
    RAISE NOTICE '=== POLÍTICAS ATIVAS ===';
    FOR rec IN 
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
        AND (policyname LIKE '%profiles%' OR policyname LIKE '%avatars%')
    LOOP
        RAISE NOTICE 'Policy: % - %', rec.policyname, rec.cmd;
    END LOOP;
END $$;

-- ============================================
-- 5. INSTRUÇÕES COMPLEMENTARES
-- ============================================

/*
INSTRUÇÕES ADICIONAIS:

Se o erro persistir, execute estes passos manualmente no Supabase:

1. Acesse o Dashboard do Supabase
2. Vá em Storage > Buckets
3. Clique em "New bucket"
4. Nome: profiles
5. Public bucket: ✅ Enabled
6. File size limit: 2 MB
7. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

ALTERNATIVA VIA API:
Execute este comando no console do navegador na página do Supabase:

```javascript
// No console do navegador
const { data, error } = await _supabaseClient.storage.createBucket('profiles', {
  public: true,
  fileSizeLimit: 2097152,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
});
console.log('Resultado:', { data, error });
```

TESTE O BUCKET:
Após criar, teste no console:

```javascript
const { data, error } = await _supabaseClient.storage.getBucket('profiles');
console.log('Bucket profiles:', { data, error });
```
*/

-- ====================================================================
-- FIM DO SCRIPT DE CORREÇÃO DO STORAGE
-- ==================================================================== 