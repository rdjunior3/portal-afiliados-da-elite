-- SCRIPT FINAL CORRIGIDO: RESOLVER UPLOAD DE PRODUTOS
-- Execute no Supabase Dashboard → SQL Editor
-- Corrige erro de sintaxe e resolve timeout de upload

-- 1. LIMPAR POLÍTICAS STORAGE CONFLITANTES
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '🔧 Iniciando limpeza de políticas storage...';
    
    -- Processar uma política por vez
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE '🗑️ Política removida: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE '✅ Todas as políticas storage antigas foram removidas';
END $$;

-- 2. CONFIGURAR BUCKET PRODUCT-IMAGES
DO $$
BEGIN
    RAISE NOTICE '📁 Configurando bucket product-images...';
    
    -- Inserir ou atualizar bucket
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

    RAISE NOTICE '✅ Bucket product-images configurado com sucesso';
END $$;

-- 3. APLICAR POLÍTICA PERMISSIVA
DO $$
BEGIN
    RAISE NOTICE '🛡️ Aplicando política permissiva...';
    
    -- Criar política ultra permissiva
    CREATE POLICY "storage_all_access" ON storage.objects
        FOR ALL 
        TO public
        USING (true)
        WITH CHECK (true);

    RAISE NOTICE '✅ Política permissiva aplicada com sucesso';
END $$;

-- 4. CONFIGURAR USUÁRIO ADMIN
DO $$
DECLARE
    admin_id UUID;
BEGIN
    RAISE NOTICE '👤 Configurando usuário admin...';
    
    -- Buscar ID do usuário admin
    SELECT id INTO admin_id FROM auth.users WHERE email = '04junior.silva09@gmail.com';
    
    IF admin_id IS NOT NULL THEN
        -- Inserir ou atualizar perfil admin
        INSERT INTO profiles (id, email, role, first_name, last_name)
        VALUES (admin_id, '04junior.silva09@gmail.com', 'admin', 'Admin', 'Elite')
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin',
            updated_at = NOW();
        
        RAISE NOTICE '✅ Admin configurado com ID: %', admin_id;
    ELSE
        RAISE NOTICE '⚠️ Usuário admin não encontrado no auth.users';
    END IF;
END $$;

-- 5. HABILITAR RLS
DO $$
BEGIN
    RAISE NOTICE '🔒 Habilitando RLS no storage...';
    
    -- Habilitar Row Level Security
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ RLS habilitado no storage.objects';
END $$;

-- 6. VERIFICAÇÃO FINAL COMPLETA
DO $$
DECLARE
    bucket_exists BOOLEAN;
    rls_enabled BOOLEAN;
    policy_count INTEGER;
    admin_exists BOOLEAN;
    all_good BOOLEAN := true;
BEGIN
    RAISE NOTICE '🧪 Iniciando verificação final...';
    
    -- Verificar se bucket existe
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets WHERE id = 'product-images'
    ) INTO bucket_exists;
    
    -- Verificar se RLS está habilitado
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'objects' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
    INTO rls_enabled;
    
    -- Contar políticas de storage
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
    INTO policy_count;
    
    -- Verificar se admin existe
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE email = '04junior.silva09@gmail.com' AND role = 'admin'
    ) INTO admin_exists;
    
    -- Exibir resultados
    RAISE NOTICE '====================================';
    RAISE NOTICE '🔍 RELATÓRIO FINAL DE VERIFICAÇÃO';
    RAISE NOTICE '====================================';
    
    RAISE NOTICE '📁 Bucket product-images: %', 
        CASE WHEN bucket_exists THEN 'EXISTE ✅' ELSE 'FALTA ❌' END;
    
    RAISE NOTICE '🔒 RLS storage.objects: %', 
        CASE WHEN rls_enabled THEN 'HABILITADO ✅' ELSE 'DESABILITADO ❌' END;
    
    RAISE NOTICE '🛡️ Políticas storage ativas: %', policy_count;
    
    RAISE NOTICE '👤 Admin configurado: %', 
        CASE WHEN admin_exists THEN 'SIM ✅' ELSE 'NÃO ❌' END;
    
    RAISE NOTICE '====================================';
    
    -- Verificar se tudo está OK
    IF NOT bucket_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Bucket product-images não existe';
        all_good := false;
    END IF;
    
    IF NOT rls_enabled THEN
        RAISE NOTICE '❌ PROBLEMA: RLS não está habilitado';
        all_good := false;
    END IF;
    
    IF policy_count = 0 THEN
        RAISE NOTICE '❌ PROBLEMA: Nenhuma política de storage encontrada';
        all_good := false;
    END IF;
    
    IF NOT admin_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Usuário admin não configurado';
        all_good := false;
    END IF;
    
    -- Resultado final
    IF all_good THEN
        RAISE NOTICE '🎉 CORREÇÃO APLICADA COM SUCESSO!';
        RAISE NOTICE '✅ Upload de produtos deve funcionar agora!';
        RAISE NOTICE '🔄 Recarregue a página e teste o upload';
    ELSE
        RAISE NOTICE '❌ Alguns problemas ainda persistem';
        RAISE NOTICE '📞 Contacte o suporte técnico se necessário';
    END IF;
    
    RAISE NOTICE '====================================';
END $$; 