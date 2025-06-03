-- =====================================================
-- CORREÇÃO FINAL: Políticas de Storage Funcionais
-- Data: 2025-01-30
-- Problema: Garantir que uploads funcionem corretamente
-- =====================================================

-- 1. REMOVER políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Admins podem fazer upload de imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "products_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "products_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_upload" ON storage.objects;

-- 2. CRIAR políticas de INSERT mais permissivas para PRODUCTS
CREATE POLICY "products_upload_by_admins"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- 3. CRIAR políticas de INSERT mais permissivas para AVATARS
CREATE POLICY "avatars_upload_by_users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- 4. CRIAR políticas de INSERT para COURSES (podem ser necessárias)
CREATE POLICY "courses_upload_by_admins"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'courses' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
  )
);

-- 5. CRIAR políticas de INSERT para UPLOADS (gerais)
CREATE POLICY "uploads_by_authenticated_users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' 
  AND auth.role() = 'authenticated'
);

-- 6. VERIFICAR se RLS está habilitado na tabela objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 7. GARANTIR que todos os buckets sejam públicos
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('products', 'avatars', 'courses', 'uploads');

-- 8. VERIFICAÇÃO: Status atual das políticas de INSERT
SELECT 'POLÍTICAS INSERT ATIVAS:' as info;

SELECT 
  policyname as politica,
  cmd as operacao,
  CASE 
    WHEN qual LIKE '%products%' THEN '🏪 PRODUCTS'
    WHEN qual LIKE '%avatars%' THEN '👤 AVATARS'
    WHEN qual LIKE '%courses%' THEN '📚 COURSES'
    WHEN qual LIKE '%uploads%' THEN '📁 UPLOADS'
    ELSE '❓ OUTROS'
  END as bucket_tipo,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND cmd = 'INSERT'
ORDER BY bucket_tipo;

-- 9. VERIFICAÇÃO: Status dos buckets
SELECT 'BUCKETS STATUS:' as info;

SELECT 
  id as bucket,
  public as publico,
  file_size_limit as limite_mb,
  allowed_mime_types as tipos_permitidos
FROM storage.buckets 
ORDER BY id;

-- 10. TESTE: Verificar permissões do usuário atual
SELECT 'SEU STATUS PARA UPLOAD:' as info;

SELECT 
  id as user_id,
  email,
  role,
  affiliate_status,
  CASE 
    WHEN role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]) 
    THEN '✅ Pode fazer upload em PRODUCTS'
    ELSE '❌ NÃO pode fazer upload em PRODUCTS (apenas avatars)'
  END as status_upload_products,
  '✅ Pode fazer upload em AVATARS' as status_upload_avatars
FROM profiles 
WHERE id = auth.uid(); 