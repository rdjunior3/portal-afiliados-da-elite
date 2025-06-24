-- ================================================================
-- FORÇA CRIAÇÃO DO BUCKET PRODUCT-IMAGES - SOLUÇÃO DIRETA
-- ================================================================

-- 1. LIMPEZA TOTAL E FORÇADA
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.buckets WHERE id = 'product-images';

-- Remover todas as políticas relacionadas
DO $$
BEGIN
    DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
    DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON storage.objects;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. CRIAÇÃO FORÇADA DO BUCKET
INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    created_at,
    updated_at
) VALUES (
    'product-images',
    'product-images',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    updated_at = now();

-- 3. POLÍTICAS ULTRA PERMISSIVAS
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Enable insert for authenticated users only" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Enable update for authenticated users only" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Enable delete for authenticated users only" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- 4. VERIFICAÇÃO FINAL
DO $$
DECLARE
    bucket_count INTEGER;
    policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO bucket_count FROM storage.buckets WHERE id = 'product-images';
    SELECT COUNT(*) INTO policies_count FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname LIKE '%product%';
    
    RAISE NOTICE '';
    RAISE NOTICE '===============================================';
    RAISE NOTICE '🎯 BUCKET PRODUCT-IMAGES CRIADO FORÇADAMENTE!';
    RAISE NOTICE 'Buckets criados: %', bucket_count;
    RAISE NOTICE 'Políticas criadas: %', policies_count;
    RAISE NOTICE '===============================================';
    RAISE NOTICE '';
    
    IF bucket_count = 0 THEN
        RAISE EXCEPTION 'FALHA: Bucket não foi criado!';
    END IF;
END $$;

-- Resultado final
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'product-images'; 