-- =====================================================
-- SCRIPT CRÍTICO DE CORREÇÃO DOS BUCKETS
-- Portal Afiliados da Elite - Storage Fix
-- Data: 2025-01-30
-- =====================================================

-- Este script cria todos os buckets necessários e suas políticas RLS

BEGIN;

-- 1. CRIAR BUCKETS NECESSÁRIOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
(
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
),
(
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
),
(
    'course-images',
    'course-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS PARA BUCKET PRODUCT-IMAGES

-- Permitir SELECT para usuários autenticados
DROP POLICY IF EXISTS "product_images_select_policy" ON storage.objects;
CREATE POLICY "product_images_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'product-images');

-- Permitir INSERT para usuários autenticados
DROP POLICY IF EXISTS "product_images_insert_policy" ON storage.objects;
CREATE POLICY "product_images_insert_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Permitir UPDATE para o próprio usuário ou admin
DROP POLICY IF EXISTS "product_images_update_policy" ON storage.objects;
CREATE POLICY "product_images_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'product-images' AND 
    (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    )
);

-- Permitir DELETE para o próprio usuário ou admin
DROP POLICY IF EXISTS "product_images_delete_policy" ON storage.objects;
CREATE POLICY "product_images_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'product-images' AND 
    (
        owner = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    )
);

-- 3. POLÍTICAS PARA BUCKET AVATARS

-- Permitir SELECT para usuários autenticados
DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
CREATE POLICY "avatars_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- Permitir INSERT para usuários autenticados
DROP POLICY IF EXISTS "avatars_insert_policy" ON storage.objects;
CREATE POLICY "avatars_insert_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Permitir UPDATE para o próprio usuário
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
CREATE POLICY "avatars_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Permitir DELETE para o próprio usuário
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;
CREATE POLICY "avatars_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

-- 4. POLÍTICAS PARA BUCKET COURSE-IMAGES

-- Permitir SELECT para usuários autenticados
DROP POLICY IF EXISTS "course_images_select_policy" ON storage.objects;
CREATE POLICY "course_images_select_policy" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'course-images');

-- Permitir INSERT para usuários autenticados
DROP POLICY IF EXISTS "course_images_insert_policy" ON storage.objects;
CREATE POLICY "course_images_insert_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-images');

-- Permitir UPDATE para admins e moderadores
DROP POLICY IF EXISTS "course_images_update_policy" ON storage.objects;
CREATE POLICY "course_images_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'course-images' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
);

-- Permitir DELETE para admins e moderadores
DROP POLICY IF EXISTS "course_images_delete_policy" ON storage.objects;
CREATE POLICY "course_images_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'course-images' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
);

COMMIT;

-- 5. VERIFICAÇÃO FINAL
DO $$
DECLARE
    bucket_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Contar buckets criados
    SELECT COUNT(*) INTO bucket_count
    FROM storage.buckets 
    WHERE id IN ('product-images', 'avatars', 'course-images');
    
    -- Contar políticas criadas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%_policy';
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ STORAGE CONFIGURADO COM SUCESSO!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🪣 Buckets criados: %/3', bucket_count;
    RAISE NOTICE '🔒 Políticas RLS criadas: %', policy_count;
    RAISE NOTICE '==============================================';
    RAISE NOTICE '📁 Buckets disponíveis:';
    RAISE NOTICE '   • product-images (5MB, público)';
    RAISE NOTICE '   • avatars (2MB, público)';
    RAISE NOTICE '   • course-images (5MB, público)';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🚀 STORAGE PRONTO PARA USAR!';
    RAISE NOTICE '==============================================';
END $$; 