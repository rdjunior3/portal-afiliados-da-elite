-- =====================================================
-- CORREÇÃO: Storage e Upload de Imagens
-- Data: 2025-01-30
-- Descrição: Corrige problemas de upload para buckets avatars e products
-- =====================================================

-- 1. Criar bucket 'products' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products', 
  'products', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Verificar se bucket 'avatars' existe, senão criar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 3. REMOVER políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Qualquer um pode visualizar produtos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar produtos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar produtos" ON storage.objects;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatar images" ON storage.objects;

-- 4. CRIAR políticas para PRODUCTS
CREATE POLICY "products_select_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "products_insert_policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "products_update_policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "products_delete_policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- 5. CRIAR políticas para AVATARS
CREATE POLICY "avatars_select_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "avatars_update_policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "avatars_delete_policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- 6. Habilitar RLS na tabela storage.objects se não estiver habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 7. Verificar se a tabela profiles tem RLS habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar buckets criados
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('products', 'avatars');

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname; 