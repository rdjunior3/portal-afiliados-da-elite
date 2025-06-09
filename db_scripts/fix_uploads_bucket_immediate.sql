-- ====================================================================
-- CORREÇÃO IMEDIATA - BUCKET UPLOADS PARA RESOLVER ERROR 404
-- Portal Afiliados da Elite - Correção de Upload de Imagens
-- ====================================================================

-- ============================================
-- 1. CRIAR/VERIFICAR BUCKET UPLOADS
-- ============================================

-- Criar bucket uploads (funcionará mesmo se já existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'uploads', 
  'uploads', 
  true,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. APLICAR POLÍTICAS PARA UPLOADS
-- ============================================

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "uploads_public_select" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_delete" ON storage.objects;

-- Política SELECT: Público pode ver uploads
CREATE POLICY "uploads_public_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');

-- Política INSERT: Usuários autenticados podem fazer upload
CREATE POLICY "uploads_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Política UPDATE: Usuários autenticados podem atualizar
CREATE POLICY "uploads_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'uploads');

-- Política DELETE: Usuários autenticados podem deletar
CREATE POLICY "uploads_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'uploads');

-- ============================================
-- 3. VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
    bucket_config RECORD;
    policy_count INTEGER;
BEGIN
    -- Verificar bucket uploads
    SELECT * INTO bucket_config 
    FROM storage.buckets 
    WHERE id = 'uploads';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Bucket uploads configurado:';
        RAISE NOTICE '   - Público: %', bucket_config.public;
        RAISE NOTICE '   - Tamanho máximo: %MB', bucket_config.file_size_limit / 1048576;
        RAISE NOTICE '   - Tipos permitidos: %', bucket_config.allowed_mime_types;
    ELSE
        RAISE NOTICE '❌ Bucket uploads não foi criado!';
    END IF;
    
    -- Verificar políticas
    SELECT COUNT(*) 
    INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE 'uploads_%';
    
    RAISE NOTICE '✅ Políticas aplicadas: %', policy_count;
    
    -- Teste rápido
    RAISE NOTICE '🎯 Estrutura pronta para: uploads/products/thumbnails/';
END $$;

-- ====================================================================
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase Dashboard
-- 2. Teste o upload de imagem imediatamente após aplicar
-- 3. As imagens ficarão em: uploads/products/thumbnails/arquivo.png
-- ==================================================================== 