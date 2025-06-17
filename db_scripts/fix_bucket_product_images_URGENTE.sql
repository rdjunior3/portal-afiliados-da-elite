-- =====================================================
-- SCRIPT URGENTE: CORREÇÃO DO BUCKET PRODUCT-IMAGES
-- Portal Afiliados da Elite - Fix Crítico
-- Data: 2025-01-30
-- =====================================================

-- Este script resolve o problema crítico do bucket product-images
-- que está impedindo o cadastro de produtos

BEGIN;

-- 1. CRIAR BUCKET PRODUCT-IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images', 
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 2. REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "product_images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete_policy" ON storage.objects;

-- 3. CRIAR POLÍTICAS PERMISSIVAS

-- SELECT: Qualquer usuário autenticado pode ver
CREATE POLICY "product_images_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'product-images');

-- INSERT: Qualquer usuário autenticado pode fazer upload 
CREATE POLICY "product_images_insert_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- UPDATE: Admins e proprietário podem atualizar
CREATE POLICY "product_images_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'product-images' AND 
    (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
);

-- DELETE: Admins e proprietário podem deletar
CREATE POLICY "product_images_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'product-images' AND 
    (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
);

COMMIT;

-- 5. VERIFICAÇÃO E RELATÓRIO
DO $$
DECLARE
    bucket_exists BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Verificar se o bucket foi criado
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets WHERE id = 'product-images'
    ) INTO bucket_exists;
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE 'product_images_%';
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🚨 CORREÇÃO URGENTE DO BUCKET CONCLUÍDA!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🪣 Bucket product-images: %', CASE WHEN bucket_exists THEN '✅ CRIADO' ELSE '❌ FALHOU' END;
    RAISE NOTICE '🔒 Políticas RLS: % criadas', policy_count;
    RAISE NOTICE '==============================================';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Teste o cadastro de produtos novamente';
    RAISE NOTICE '2. Verifique se o upload de imagens funciona';
    RAISE NOTICE '3. Monitore os logs do console';
    RAISE NOTICE '==============================================';
    
    IF bucket_exists AND policy_count >= 4 THEN
        RAISE NOTICE '🎉 BUCKET CONFIGURADO COM SUCESSO!';
    ELSE
        RAISE NOTICE '⚠️ VERIFICAR CONFIGURAÇÃO MANUALMENTE';
    END IF;
    RAISE NOTICE '==============================================';
END $$; 