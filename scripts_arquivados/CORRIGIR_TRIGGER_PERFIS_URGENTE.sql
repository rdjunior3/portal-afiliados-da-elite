-- ========================================
-- CORREÇÃO URGENTE: TRIGGER AUTOMÁTICO DE PERFIS
-- ========================================
-- COPIE E COLE ESTE SCRIPT NO SQL EDITOR DO SUPABASE:
-- https://supabase.com/dashboard/project/vhociemaoccrkpcylpit/sql

-- 1. RECRIAR FUNÇÃO HANDLE_NEW_USER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    first_name TEXT;
    last_name TEXT;
    avatar_url TEXT;
BEGIN
    -- Extrair dados do usuário
    user_email := COALESCE(NEW.email, '');
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        ''
    );
    avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url', 
        NEW.raw_user_meta_data->>'picture',
        NULL
    );
    
    -- Dividir nome completo
    IF user_name != '' THEN
        first_name := SPLIT_PART(user_name, ' ', 1);
        last_name := CASE 
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(user_name, ' '), 1) > 1 
            THEN TRIM(SUBSTRING(user_name FROM POSITION(' ' IN user_name) + 1))
            ELSE ''
        END;
    ELSE
        first_name := SPLIT_PART(user_email, '@', 1);
        last_name := '';
    END IF;

    -- Inserir perfil
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
        NEW.id,
        user_email,
        first_name,
        last_name,
        avatar_url,
        'affiliate',
        'pending',
        10.00,
        0.00,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RECRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 3. CRIAR PERFIS PARA USUÁRIOS EXISTENTES SEM PERFIL
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
)
SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(
        SPLIT_PART(
            COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                SPLIT_PART(u.email, '@', 1)
            ), ' ', 1
        ), ''
    ),
    CASE 
        WHEN ARRAY_LENGTH(STRING_TO_ARRAY(
            COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                ''
            ), ' '
        ), 1) > 1 
        THEN TRIM(SUBSTRING(
            COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                ''
            ) FROM POSITION(' ' IN COALESCE(
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'name',
                ''
            )) + 1
        ))
        ELSE ''
    END,
    COALESCE(
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture',
        NULL
    ),
    'affiliate',
    'pending',
    10.00,
    0.00,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. VERIFICAR RESULTADO
SELECT 
    'Usuários sem perfil' as status,
    COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Total de usuários' as status,
    COUNT(*) as quantidade
FROM auth.users

UNION ALL

SELECT 
    'Total de perfis' as status,
    COUNT(*) as quantidade
FROM profiles; 