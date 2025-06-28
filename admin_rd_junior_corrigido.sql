-- CRIAR ADMIN: rd.junior1@hotmail.com
-- Senha: 33milhoes

-- 1. VERIFICAR SE O USUÁRIO EXISTE
DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email = 'rd.junior1@hotmail.com';
    SELECT COUNT(*) INTO profile_count FROM profiles WHERE email = 'rd.junior1@hotmail.com';
    
    RAISE NOTICE 'Usuário na auth.users: %', user_count;
    RAISE NOTICE 'Perfil na profiles: %', profile_count;
    
    IF user_count = 0 THEN
        RAISE NOTICE 'ATENÇÃO: Usuário ainda não se registrou';
    END IF;
END $$;

-- 2. ATUALIZAR TRIGGER PARA AUTO-ADMIN
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    first_name TEXT;
    last_name TEXT;
    user_role user_role;
BEGIN
    user_email := COALESCE(NEW.email, '');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
    
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

    -- Determinar role baseado no email
    IF user_email IN ('04junior.silva09@gmail.com', 'rd.junior1@hotmail.com') THEN
        user_role := 'admin'::user_role;
        RAISE NOTICE 'ADMIN DETECTADO: %', user_email;
    ELSE
        user_role := 'affiliate'::user_role;
    END IF;

    INSERT INTO profiles (
        id, email, first_name, last_name, role, affiliate_status,
        commission_rate, total_earnings, created_at, updated_at
    ) VALUES (
        NEW.id, user_email, first_name, last_name, user_role, 'approved',
        10.00, 0.00, NOW(), NOW()
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro ao criar perfil: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 3. PROMOVER USUÁRIO PARA ADMIN (SE JÁ EXISTE)
UPDATE profiles 
SET role = 'admin', affiliate_status = 'approved', updated_at = NOW()
WHERE email = 'rd.junior1@hotmail.com';

-- 4. VERIFICAÇÃO FINAL
SELECT 
    email, role, affiliate_status, created_at
FROM profiles 
WHERE role = 'admin'
ORDER BY created_at;

-- 5. INSTRUÇÕES
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'INSTRUÇÕES:';
    RAISE NOTICE '1. Registrar com: rd.junior1@hotmail.com / 33milhoes';
    RAISE NOTICE '2. Link: https://portal-afiliados-da-elite.vercel.app/signup';
    RAISE NOTICE '3. O sistema criará admin automaticamente';
    RAISE NOTICE '';
END $$; 