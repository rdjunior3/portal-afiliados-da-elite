-- ====================================================================
-- MELHORIA DA ORGANIZAÇÃO DOS BUCKETS DE STORAGE
-- Portal Afiliados da Elite - Otimização da Estrutura de Buckets
-- ====================================================================

-- ============================================
-- ESTRATÉGIA: USAR BUCKET UPLOADS UNIFICADO
-- ============================================

-- Em vez de múltiplos buckets, usar um bucket "uploads" com estrutura de pastas:
-- uploads/
--   ├── products/
--   │   ├── thumbnails/
--   │   ├── galleries/
--   │   └── banners/
--   ├── profiles/
--   │   ├── avatars/
--   │   └── covers/
--   ├── courses/
--   │   ├── thumbnails/
--   │   └── materials/
--   └── temp/
--       └── [uploads temporários]

-- ============================================
-- 1. CRIAR BUCKET UPLOADS UNIFICADO
-- ============================================

-- Criar bucket uploads principal (mais flexível)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'uploads', 
  'uploads', 
  true,
  20971520, -- 20MB limit (mais generoso)
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif',
    'video/mp4', 'video/webm', 'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. POLÍTICAS PARA BUCKET UPLOADS UNIFICADO
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "uploads_public_select" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_delete" ON storage.objects;

-- Política de SELECT: Público pode ver todos os uploads
CREATE POLICY "uploads_public_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');

-- Política de INSERT: Usuários autenticados podem fazer upload
CREATE POLICY "uploads_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Política de UPDATE: Usuários autenticados podem atualizar
CREATE POLICY "uploads_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'uploads');

-- Política de DELETE: Usuários autenticados podem deletar
CREATE POLICY "uploads_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'uploads');

-- ============================================
-- 3. VERIFICAR CONFIGURAÇÃO
-- ============================================

DO $$
DECLARE
    bucket_config RECORD;
    policy_count INTEGER;
BEGIN
    -- Verificar bucket
    SELECT * INTO bucket_config 
    FROM storage.buckets 
    WHERE id = 'uploads';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Bucket uploads configurado:';
        RAISE NOTICE '   - Público: %', bucket_config.public;
        RAISE NOTICE '   - Tamanho máximo: %MB', bucket_config.file_size_limit / 1048576;
        RAISE NOTICE '   - Tipos permitidos: %', bucket_config.allowed_mime_types;
    ELSE
        RAISE NOTICE '❌ Bucket uploads não encontrado!';
    END IF;
    
    -- Verificar políticas
    SELECT COUNT(*) 
    INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE 'uploads_%';
    
    RAISE NOTICE '✅ Políticas configuradas: %', policy_count;
END $$;

-- ====================================================================
-- INSTRUÇÕES PARA USAR A NOVA ESTRUTURA:
-- 
-- No código React, usar desta forma:
-- 
-- Para produtos:
-- <ImageUpload bucket="uploads" folder="products/thumbnails" />
-- 
-- Para avatares:
-- <ImageUpload bucket="uploads" folder="profiles/avatars" />
-- 
-- Para cursos:
-- <ImageUpload bucket="uploads" folder="courses/thumbnails" />
-- 
-- VANTAGENS:
-- ✅ Menos buckets para gerenciar
-- ✅ Políticas mais simples e consistentes
-- ✅ Estrutura organizacional clara
-- ✅ Facilita backup e manutenção
-- ✅ Evita problemas de permissões por bucket
-- ==================================================================== 