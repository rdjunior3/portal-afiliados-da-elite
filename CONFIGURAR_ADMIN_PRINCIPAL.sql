-- ========================================
-- CONFIGURAR ADMIN PRINCIPAL
-- ========================================
-- COPIE E COLE ESTE SCRIPT NO SQL EDITOR DO SUPABASE:
-- https://supabase.com/dashboard/project/vhociemaoccrkpcylpit/sql

-- 1. VERIFICAR SE O USUÁRIO EXISTE
DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Verificar na tabela auth.users
    SELECT COUNT(*) INTO user_count 
    FROM auth.users 
    WHERE email = '04junior.silva09@gmail.com';
    
    -- Verificar na tabela profiles
    SELECT COUNT(*) INTO profile_count 
    FROM profiles 
    WHERE email = '04junior.silva09@gmail.com';
    
    RAISE NOTICE '📊 VERIFICAÇÃO INICIAL:';
    RAISE NOTICE '   - Usuário na auth.users: %', user_count;
    RAISE NOTICE '   - Perfil na profiles: %', profile_count;
    
    IF user_count = 0 THEN
        RAISE NOTICE '⚠️  ATENÇÃO: Usuário 04junior.silva09@gmail.com não encontrado na auth.users';
        RAISE NOTICE '   Certifique-se de que o usuário já fez login pelo menos uma vez';
    END IF;
END $$;

-- 2. CONFIGURAR COMO ADMIN PRINCIPAL
UPDATE profiles 
SET 
    role = 'admin',
    affiliate_status = 'approved',
    updated_at = NOW()
WHERE email = '04junior.silva09@gmail.com';

-- 3. VERIFICAR SE A ATUALIZAÇÃO FOI REALIZADA
DO $$
DECLARE
    updated_count INTEGER;
    user_info RECORD;
BEGIN
    -- Contar quantos registros foram atualizados
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE '📝 RESULTADO DA ATUALIZAÇÃO:';
    RAISE NOTICE '   - Registros atualizados: %', updated_count;
    
    IF updated_count > 0 THEN
        -- Buscar informações do usuário atualizado
        SELECT 
            email,
            first_name,
            last_name,
            role,
            affiliate_status,
            created_at,
            updated_at
        INTO user_info
        FROM profiles 
        WHERE email = '04junior.silva09@gmail.com';
        
        RAISE NOTICE '✅ ADMIN PRINCIPAL CONFIGURADO COM SUCESSO!';
        RAISE NOTICE '   - Email: %', user_info.email;
        RAISE NOTICE '   - Nome: % %', COALESCE(user_info.first_name, ''), COALESCE(user_info.last_name, '');
        RAISE NOTICE '   - Role: %', user_info.role;
        RAISE NOTICE '   - Status: %', user_info.affiliate_status;
        RAISE NOTICE '   - Criado em: %', user_info.created_at;
        RAISE NOTICE '   - Atualizado em: %', user_info.updated_at;
    ELSE
        RAISE NOTICE '❌ NENHUM REGISTRO ATUALIZADO';
        RAISE NOTICE '   Possíveis causas:';
        RAISE NOTICE '   1. Usuário não existe na tabela profiles';
        RAISE NOTICE '   2. Email digitado incorretamente';
        RAISE NOTICE '   3. Usuário ainda não fez login pela primeira vez';
    END IF;
END $$;

-- 4. CRIAR PERFIL SE NÃO EXISTIR (BACKUP)
-- Este bloco só executa se o usuário não existir na tabela profiles
DO $$
DECLARE
    auth_user_id UUID;
    auth_user_email TEXT;
    auth_user_name TEXT;
BEGIN
    -- Buscar dados do usuário na auth.users
    SELECT 
        id,
        email,
        COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
    INTO auth_user_id, auth_user_email, auth_user_name
    FROM auth.users 
    WHERE email = '04junior.silva09@gmail.com';
    
    -- Se usuário existe na auth mas não na profiles, criar perfil
    IF auth_user_id IS NOT NULL THEN
        INSERT INTO profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            affiliate_status,
            commission_rate,
            total_earnings,
            created_at,
            updated_at
        ) VALUES (
            auth_user_id,
            auth_user_email,
            SPLIT_PART(auth_user_name, ' ', 1),
            CASE 
                WHEN ARRAY_LENGTH(STRING_TO_ARRAY(auth_user_name, ' '), 1) > 1 
                THEN TRIM(SUBSTRING(auth_user_name FROM POSITION(' ' IN auth_user_name) + 1))
                ELSE ''
            END,
            'admin',
            'approved',
            10.00,
            0.00,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            affiliate_status = 'approved',
            updated_at = NOW();
            
        RAISE NOTICE '🔨 PERFIL CRIADO/ATUALIZADO PARA ADMIN PRINCIPAL';
    END IF;
END $$;

-- 5. VERIFICAÇÃO FINAL
SELECT 
    '🎯 CONFIGURAÇÃO FINAL' as status,
    email,
    first_name,
    last_name,
    role,
    affiliate_status,
    commission_rate,
    total_earnings,
    created_at,
    updated_at
FROM profiles 
WHERE email = '04junior.silva09@gmail.com';

-- 6. VERIFICAR PERMISSÕES DE ADMIN
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM profiles 
    WHERE role = 'admin';
    
    RAISE NOTICE '👑 ADMINISTRADORES NO SISTEMA: %', admin_count;
    
    -- Listar todos os admins
    FOR admin_record IN 
        SELECT email, first_name, last_name, role, affiliate_status
        FROM profiles 
        WHERE role = 'admin'
        ORDER BY created_at
    LOOP
        RAISE NOTICE '   - %: % % (Status: %)', 
            admin_record.email, 
            COALESCE(admin_record.first_name, ''), 
            COALESCE(admin_record.last_name, ''),
            admin_record.affiliate_status;
    END LOOP;
END $$; 