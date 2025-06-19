-- ========================================
-- TRIGGER AUTOMÁTICO PARA CRIAÇÃO DE PERFIS
-- ========================================
-- Script para implementar criação automática de perfis
-- quando usuários são criados via Google OAuth

-- Função para lidar com novos usuários
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
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
    avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL);
    
    -- Dividir nome completo em primeiro e último nome
    IF user_name != '' THEN
        first_name := SPLIT_PART(user_name, ' ', 1);
        last_name := CASE 
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(user_name, ' '), 1) > 1 
            THEN TRIM(SUBSTRING(user_name FROM POSITION(' ' IN user_name) + 1))
            ELSE ''
        END;
    ELSE
        first_name := '';
        last_name := '';
    END IF;

    -- Log do processo
    RAISE LOG 'Creating profile for user: % with email: %', NEW.id, user_email;

    -- Inserir perfil automaticamente
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
        'affiliate'::user_role,
        'pending'::affiliate_status,
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

    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        -- Não falha o processo de criação do usuário mesmo se o perfil falhar
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para execução automática
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- Garantir que a função seja executada como super usuário
ALTER FUNCTION handle_new_user() OWNER TO postgres;

-- Conceder permissões necessárias
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Trigger automático para criação de perfis implementado com sucesso!';
    RAISE NOTICE 'Agora todos os novos usuários (incluindo Google OAuth) terão perfis criados automaticamente.';
END $$; 