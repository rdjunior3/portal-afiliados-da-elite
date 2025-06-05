-- =====================================================
-- SCRIPT PARA CRIAR BUCKET DE AVATARES - SUPABASE
-- Portal Afiliados da Elite - Correção de Upload
-- Data: 2025-01-30
-- =====================================================

-- 1. CRIAR BUCKET AVATARS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. CRIAR BUCKET PROFILES (ALTERNATIVO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profiles', 
  'profiles', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. POLÍTICAS PARA BUCKET AVATARS
CREATE POLICY IF NOT EXISTS "avatars_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "avatars_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "avatars_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "avatars_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- 4. POLÍTICAS PARA BUCKET PROFILES
CREATE POLICY IF NOT EXISTS "profiles_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profiles');

CREATE POLICY IF NOT EXISTS "profiles_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profiles');

CREATE POLICY IF NOT EXISTS "profiles_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profiles');

CREATE POLICY IF NOT EXISTS "profiles_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profiles');

-- 5. VERIFICAÇÃO FINAL
SELECT 
  'BUCKET AVATARS:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') 
    THEN '✅ CRIADO' 
    ELSE '❌ NÃO ENCONTRADO' 
  END as status;

SELECT 
  'BUCKET PROFILES:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profiles') 
    THEN '✅ CRIADO' 
    ELSE '❌ NÃO ENCONTRADO' 
  END as status;

-- 6. LISTAR POLÍTICAS CRIADAS
SELECT 
  policyname as politica,
  cmd as operacao,
  'STORAGE OBJECTS' as tabela
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (policyname LIKE '%avatars%' OR policyname LIKE '%profiles%')
ORDER BY policyname; 