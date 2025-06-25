-- SOLUÇÃO URGENTE: UPLOAD STORAGE TRAVANDO
-- Este script resolve definitivamente o problema de upload de imagens
-- Executar no Supabase Dashboard SQL Editor

-- 1. REMOVER TODAS AS POLÍTICAS CONFLITANTES DE STORAGE
DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all to view product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload for storage" ON storage.objects;
DROP POLICY IF EXISTS "Storage Upload Policy" ON storage.objects;
DROP POLICY IF EXISTS "Storage Read Policy" ON storage.objects;
DROP POLICY IF EXISTS "Storage Delete Policy" ON storage.objects;

-- 2. VERIFICAR SE BUCKET product-images EXISTE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'product-images',
            'product-images',
            true,
            10485760, -- 10MB
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        );
        RAISE NOTICE '✅ Bucket product-images criado com sucesso!';
    ELSE
        RAISE NOTICE '✅ Bucket product-images já existe!';
    END IF;
END $$;

-- 3. APLICAR POLÍTICAS ULTRA PERMISSIVAS PARA STORAGE
-- Política para UPLOAD (INSERT) - ULTRA PERMISSIVA
CREATE POLICY "ULTRA_PERMISSIVE_UPLOAD_POLICY"
ON storage.objects
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Política para LEITURA (SELECT) - ULTRA PERMISSIVA
CREATE POLICY "ULTRA_PERMISSIVE_READ_POLICY"
ON storage.objects
FOR SELECT
TO authenticated, anon, public
USING (true);

-- Política para ATUALIZAÇÃO (UPDATE) - ULTRA PERMISSIVA
CREATE POLICY "ULTRA_PERMISSIVE_UPDATE_POLICY"
ON storage.objects
FOR UPDATE
TO authenticated, anon
USING (true);

-- Política para EXCLUSÃO (DELETE) - ULTRA PERMISSIVA
CREATE POLICY "ULTRA_PERMISSIVE_DELETE_POLICY"
ON storage.objects
FOR DELETE
TO authenticated, anon
USING (true);

-- 4. VERIFICAR USUÁRIO ADMIN
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = '04junior.silva09@gmail.com' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Garantir que perfil admin existe
        INSERT INTO public.profiles (id, email, role, first_name, last_name, created_at, updated_at)
        VALUES (
            admin_user_id,
            '04junior.silva09@gmail.com',
            'admin',
            'Admin',
            'Elite',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            updated_at = NOW();
        
        RAISE NOTICE '✅ Usuário admin configurado: %', admin_user_id;
    ELSE
        RAISE NOTICE '⚠️ Usuário admin não encontrado na tabela auth.users';
    END IF;
END $$;

-- 5. FORÇAR HABILITAÇÃO RLS MAS COM POLÍTICAS PERMISSIVAS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. TESTAR CONFIGURAÇÃO
DO $$
BEGIN
    RAISE NOTICE '🧪 TESTE DE CONFIGURAÇÃO:';
    RAISE NOTICE '📁 Bucket product-images: %', (SELECT CASE WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN 'EXISTE ✅' ELSE 'NÃO EXISTE ❌' END);
    RAISE NOTICE '🔒 RLS Storage: %', (SELECT CASE WHEN relrowsecurity THEN 'HABILITADO ✅' ELSE 'DESABILITADO ❌' END FROM pg_class WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage'));
    RAISE NOTICE '🛡️ Políticas Storage: %', (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects');
    RAISE NOTICE '👤 Admin Role: %', (SELECT CASE WHEN EXISTS(SELECT 1 FROM profiles WHERE email = '04junior.silva09@gmail.com' AND role = 'admin') THEN 'CONFIGURADO ✅' ELSE 'ERRO ❌' END);
END $$;

-- FINALIZADO: Sistema de storage configurado com políticas ultra permissivas
-- O upload agora deve funcionar normalmente 