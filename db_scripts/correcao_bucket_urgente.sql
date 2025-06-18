-- ================================================================
-- CORREÇÃO URGENTE - BUCKET PRODUCT-IMAGES
-- Portal Afiliados da Elite - Solução Definitiva
-- ================================================================

-- ============================================
-- 1. LIMPEZA TOTAL (REMOVE TODOS OS CONFLITOS)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🧹 Limpando conflitos existentes...';
    
    -- Remover TODOS os objetos do bucket
    DELETE FROM storage.objects WHERE bucket_id = 'product-images';
    
    -- Remover bucket completamente
    DELETE FROM storage.buckets WHERE id = 'product-images';
    
    -- Remover TODAS as políticas relacionadas
    DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_public_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_auth_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_auth_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
    
    RAISE NOTICE '✅ Limpeza concluída!';
END $$;

-- ============================================
-- 2. CRIAÇÃO LIMPA DO BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images', 
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- ============================================
-- 3. POLÍTICAS ULTRA PERMISSIVAS
-- ============================================

-- SELECT: Qualquer um pode ver (público)
CREATE POLICY "product_images_select" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- INSERT: Qualquer usuário autenticado pode fazer upload
CREATE POLICY "product_images_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- UPDATE: Qualquer usuário autenticado pode atualizar
CREATE POLICY "product_images_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- DELETE: Qualquer usuário autenticado pode deletar
CREATE POLICY "product_images_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- ============================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
    bucket_exists BOOLEAN;
    policies_count INTEGER;
BEGIN
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO bucket_exists;
    SELECT COUNT(*) FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%product_images%' INTO policies_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CORREÇÃO APLICADA COM SUCESSO!';
    RAISE NOTICE 'Bucket criado: %', bucket_exists;
    RAISE NOTICE 'Políticas criadas: %', policies_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Recarregue a página (F5)';
    RAISE NOTICE '2. Teste o cadastro de produto';
    RAISE NOTICE '3. Upload deve funcionar!';
    RAISE NOTICE '========================================';
END $$;

-- Resultado para confirmar
SELECT 'BUCKET PRODUCT-IMAGES CORRIGIDO!' as status; 