-- ====================================================================
-- CORREÇÃO URGENTE: PERFIL INEXISTENTE + UPLOAD DE AVATAR
-- Portal Afiliados da Elite - Correção do Loop de Upload
-- Data: 04/06/2025
-- ====================================================================

-- ============================================
-- 1. DIAGNÓSTICO INICIAL
-- ============================================

DO $$
DECLARE
    user_exists boolean;
    profile_exists boolean;
    bucket_exists boolean;
    user_email TEXT;
BEGIN
    -- Verificar se usuário existe no auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da'
    ) INTO user_exists;
    
    -- Verificar se perfil existe
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da'
    ) INTO profile_exists;
    
    -- Verificar se bucket avatars existe
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'avatars'
    ) INTO bucket_exists;
    
    -- Obter email do usuário
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da';
    
    RAISE NOTICE '=== DIAGNÓSTICO INICIAL ===';
    RAISE NOTICE 'Usuário existe no auth.users: %', user_exists;
    RAISE NOTICE 'Email do usuário: %', COALESCE(user_email, 'NÃO ENCONTRADO');
    RAISE NOTICE 'Perfil existe na tabela profiles: %', profile_exists;
    RAISE NOTICE 'Bucket avatars existe: %', bucket_exists;
    RAISE NOTICE '================================';
END $$;

-- ============================================
-- 2. CORREÇÃO DO PERFIL INEXISTENTE
-- ============================================

DO $$
DECLARE
    user_record RECORD;
    user_name TEXT;
    first_name TEXT;
    last_name TEXT;
    avatar_url TEXT;
BEGIN
    -- Buscar dados do usuário no auth.users
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da';
    
    IF user_record.id IS NULL THEN
        RAISE NOTICE '❌ ERRO: Usuário não encontrado no auth.users';
        RETURN;
    END IF;
    
    -- Verificar se perfil já existe
    IF EXISTS (SELECT 1 FROM profiles WHERE id = user_record.id) THEN
        RAISE NOTICE '✅ Perfil já existe para o usuário: %', user_record.email;
        RETURN;
    END IF;
    
    -- Extrair dados do usuário
    user_name := COALESCE(
        user_record.raw_user_meta_data->>'full_name',
        user_record.raw_user_meta_data->>'name',
        SPLIT_PART(user_record.email, '@', 1)
    );
    
    avatar_url := COALESCE(
        user_record.raw_user_meta_data->>'avatar_url',
        user_record.raw_user_meta_data->>'picture',
        NULL
    );
    
    -- Dividir nome completo
    IF user_name IS NOT NULL AND user_name != '' THEN
        first_name := SPLIT_PART(user_name, ' ', 1);
        last_name := CASE 
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(user_name, ' '), 1) > 1 
            THEN TRIM(SUBSTRING(user_name FROM POSITION(' ' IN user_name) + 1))
            ELSE ''
        END;
    ELSE
        first_name := SPLIT_PART(user_record.email, '@', 1);
        last_name := '';
    END IF;
    
    RAISE NOTICE '📝 Criando perfil com dados:';
    RAISE NOTICE '   Email: %', user_record.email;
    RAISE NOTICE '   Nome completo: %', user_name;
    RAISE NOTICE '   Primeiro nome: %', first_name;
    RAISE NOTICE '   Último nome: %', last_name;
    RAISE NOTICE '   Avatar URL: %', avatar_url;
    
    -- Criar perfil
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role,
        affiliate_status,
        commission_rate,
        total_earnings,
        created_at,
        updated_at
    ) VALUES (
        user_record.id,
        user_record.email,
        first_name,
        last_name,
        avatar_url,
        'affiliate',
        'approved',
        10.00,
        0.00,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ PERFIL CRIADO COM SUCESSO para: %', user_record.email;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO ao criar perfil: %', SQLERRM;
END $$;

-- ============================================
-- 3. CONFIGURAÇÃO DO BUCKET AVATARS
-- ============================================

-- Criar/atualizar bucket avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 4. POLÍTICAS RLS ULTRA PERMISSIVAS
-- ============================================

-- Remover todas as políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver avatars públicos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus avatars" ON storage.objects;

-- Criar políticas ULTRA PERMISSIVAS para resolver timeout
CREATE POLICY "avatars_public_access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_full_access" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- ============================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
    profile_count INTEGER;
    bucket_count INTEGER;
    policy_count INTEGER;
    user_profile RECORD;
BEGIN
    -- Verificar perfil criado
    SELECT COUNT(*) INTO profile_count 
    FROM profiles 
    WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da';
    
    -- Verificar bucket
    SELECT COUNT(*) INTO bucket_count 
    FROM storage.buckets 
    WHERE id = 'avatars';
    
    -- Verificar políticas
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE 'avatars_%';
    
    -- Buscar dados do perfil
    SELECT * INTO user_profile 
    FROM profiles 
    WHERE id = '99a703eb-9db2-48cd-affa-90fb4527c3da';
    
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    RAISE NOTICE 'Perfis encontrados: %', profile_count;
    RAISE NOTICE 'Buckets avatars: %', bucket_count;
    RAISE NOTICE 'Políticas avatars: %', policy_count;
    
    IF user_profile.id IS NOT NULL THEN
        RAISE NOTICE 'Perfil criado:';
        RAISE NOTICE '  ID: %', user_profile.id;
        RAISE NOTICE '  Email: %', user_profile.email;
        RAISE NOTICE '  Nome: % %', user_profile.first_name, user_profile.last_name;
        RAISE NOTICE '  Role: %', user_profile.role;
        RAISE NOTICE '  Status: %', user_profile.affiliate_status;
    END IF;
    
    RAISE NOTICE '========================';
    
    IF profile_count > 0 AND bucket_count > 0 AND policy_count >= 2 THEN
        RAISE NOTICE '🎉 CORREÇÃO APLICADA COM SUCESSO!';
        RAISE NOTICE '✅ Perfil criado';
        RAISE NOTICE '✅ Bucket avatars configurado';
        RAISE NOTICE '✅ Políticas RLS aplicadas';
        RAISE NOTICE '';
        RAISE NOTICE '📱 PRÓXIMOS PASSOS:';
        RAISE NOTICE '1. Recarregue a página do dashboard';
        RAISE NOTICE '2. Tente fazer upload do avatar novamente';
        RAISE NOTICE '3. O upload deve funcionar sem timeout';
    ELSE
        RAISE NOTICE '❌ CORREÇÃO INCOMPLETA - verifique os logs acima';
    END IF;
END $$; 