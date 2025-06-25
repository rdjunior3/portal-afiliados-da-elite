-- SCRIPT SIMPLES E FUNCIONAL - RESOLVER UPLOAD
-- Execute no Supabase Dashboard → SQL Editor
-- Funciona apenas com operações permitidas

-- 1. REMOVER POLÍTICAS CONFLITANTES (uma por vez para evitar erros)
DROP POLICY IF EXISTS "storage_all_access" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all to view product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload for storage" ON storage.objects;
DROP POLICY IF EXISTS "Storage Upload Policy" ON storage.objects;
DROP POLICY IF EXISTS "Storage Read Policy" ON storage.objects;
DROP POLICY IF EXISTS "Storage Delete Policy" ON storage.objects;

-- 2. CRIAR/ATUALIZAR BUCKET PRODUCT-IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images', 
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 3. CRIAR POLÍTICA ULTRA PERMISSIVA PARA UPLOAD
CREATE POLICY "product_images_all_access" ON storage.objects
    FOR ALL 
    TO public
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');

-- 4. CONFIGURAR USUÁRIO ADMIN (SE NECESSÁRIO)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = '04junior.silva09@gmail.com';
    
    -- Se encontrou o usuário, criar/atualizar perfil
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, role, first_name, last_name)
        VALUES (admin_user_id, '04junior.silva09@gmail.com', 'admin', 'Admin', 'Elite')
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin',
            updated_at = NOW();
    END IF;
END $$;

-- 5. VERIFICAÇÃO FINAL
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'product-images') 
        THEN '✅ Bucket product-images existe' 
        ELSE '❌ Bucket product-images não encontrado' 
    END as bucket_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'product_images_all_access') 
        THEN '✅ Política criada' 
        ELSE '❌ Política não encontrada' 
    END as policy_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM profiles WHERE email = '04junior.silva09@gmail.com' AND role = 'admin') 
        THEN '✅ Admin configurado' 
        ELSE '⚠️ Admin não encontrado' 
    END as admin_status; 