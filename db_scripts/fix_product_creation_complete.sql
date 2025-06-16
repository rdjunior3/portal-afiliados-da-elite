-- =============================================
-- FIX PARA PROBLEMAS DE CRIAÇÃO DE PRODUTOS
-- Execute no Dashboard do Supabase
-- =============================================

-- 1. VERIFICAR E CRIAR BUCKET PRODUCT-IMAGES
DO $$ 
BEGIN
    -- Verificar se bucket já existe
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        -- Criar bucket para imagens de produtos
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'product-images',
            'product-images',
            true,
            52428800, -- 50MB limit
            ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        );
        
        RAISE NOTICE '✅ Bucket product-images criado com sucesso';
    ELSE
        -- Atualizar configurações do bucket existente
        UPDATE storage.buckets 
        SET 
            public = true,
            file_size_limit = 52428800,
            allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        WHERE id = 'product-images';
        
        RAISE NOTICE '✅ Bucket product-images já existe - configurações atualizadas';
    END IF;
END $$;

-- 2. REMOVER POLÍTICAS ANTIGAS CONFLITANTES
DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;

-- 3. CRIAR POLÍTICAS ROBUSTAS PARA O BUCKET
-- Política para visualização pública
CREATE POLICY "product_images_select" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para upload (apenas admins)
CREATE POLICY "product_images_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Política para atualização (apenas admins)
CREATE POLICY "product_images_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'product-images' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    bucket_id = 'product-images' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Política para exclusão (apenas admins)
CREATE POLICY "product_images_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'product-images' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- 4. VERIFICAR E CORRIGIR POLÍTICAS RLS DA TABELA PRODUCTS
-- Garantir que as políticas de UPDATE tenham WITH CHECK
DROP POLICY IF EXISTS "products_admin_update" ON products;

CREATE POLICY "products_admin_update" ON products
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- 5. VERIFICAR STATUS FINAL
SELECT 
    'Bucket product-images' as componente,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') 
        THEN '✅ Configurado' 
        ELSE '❌ Ausente' 
    END as status;

SELECT 
    'Políticas Storage' as componente,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE 'product_images_%';

SELECT 
    'Políticas Products' as componente,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'products' 
AND schemaname = 'public';

-- Finalização
SELECT '🎉 Script executado com sucesso! Agora teste o cadastro de produtos.' as resultado; 