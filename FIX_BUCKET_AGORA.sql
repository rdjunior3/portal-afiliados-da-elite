-- ================================================================
-- FIX URGENTE: CRIAR BUCKET PRODUCT-IMAGES AGORA
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

-- Passo 1: Limpar tudo relacionado ao bucket
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.buckets WHERE id = 'product-images';

-- Passo 2: Criar o bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'product-images',
    'product-images',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    now(),
    now()
);

-- Passo 3: Criar políticas simples
CREATE POLICY "bucket_product_images_select" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "bucket_product_images_insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "bucket_product_images_update" ON storage.objects
FOR UPDATE TO authenticated 
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "bucket_product_images_delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- Verificação
SELECT 'BUCKET CRIADO!' as status, id, name, public FROM storage.buckets WHERE id = 'product-images'; 