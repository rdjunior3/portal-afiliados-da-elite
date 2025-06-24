-- ========================================
-- CORREÇÃO CRÍTICA: TRIGGER AUTOMÁTICO DE PERFIS
-- ========================================
-- Este script corrige o problema de perfis não sendo criados automaticamente

-- 1. VERIFICAR ESTADO ATUAL
DO $$
BEGIN
    -- Verificar se o trigger existe
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created já existe';
    ELSE
        RAISE NOTICE '❌ Trigger on_auth_user_created NÃO existe';
    END IF;

    -- Verificar se a função existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN
        RAISE NOTICE '✅ Função handle_new_user já existe';
    ELSE
        RAISE NOTICE '❌ Função handle_new_user NÃO existe';
    END IF;
END $$;

-- 2. RECRIAR FUNÇÃO HANDLE_NEW_USER (VERSÃO CORRIGIDA)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    first_name TEXT;
    last_name TEXT;
    avatar_url TEXT;
    existing_profile_count INTEGER;
BEGIN
    -- Log inicial
    RAISE LOG 'handle_new_user triggered for user ID: %', NEW.id;
    
    -- Verificar se perfil já existe
    SELECT COUNT(*) INTO existing_profile_count 
    FROM profiles 
    WHERE id = NEW.id;
    
    IF existing_profile_count > 0 THEN
        RAISE LOG 'Profile already exists for user: %, skipping creation', NEW.id;
        RETURN NEW;
    END IF;

    -- Extrair dados do usuário
    user_email := COALESCE(NEW.email, '');
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'display_name',
        ''
    );
    avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url', 
        NEW.raw_user_meta_data->>'picture',
        NEW.raw_user_meta_data->>'photo',
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
        -- Fallback: usar parte do email como nome
        first_name := SPLIT_PART(user_email, '@', 1);
        last_name := '';
    END IF;

    -- Log dos dados extraídos
    RAISE LOG 'Creating profile with data: email=%, name=%, avatar=%', user_email, user_name, avatar_url;

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
        'affiliate'::user_role,
        'pending'::affiliate_status,
        10.00,
        0.00,
        NOW(),
        NOW()
    );

    RAISE LOG '✅ Profile created successfully for user: % (email: %)', NEW.id, user_email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '❌ Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Log detalhado do erro
        RAISE LOG 'Error details: user_email=%, first_name=%, last_name=%', user_email, first_name, last_name;
        RETURN NEW; -- Não falha o processo de auth
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RECRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 4. CONFIGURAR PERMISSÕES
ALTER FUNCTION handle_new_user() OWNER TO postgres;
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;
GRANT INSERT, UPDATE, SELECT ON profiles TO postgres;

-- 5. TESTAR COM USUÁRIOS EXISTENTES SEM PERFIL
DO $$
DECLARE
    user_record RECORD;
    users_without_profile INTEGER;
BEGIN
    -- Contar usuários sem perfil
    SELECT COUNT(*) INTO users_without_profile
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE 'Encontrados % usuários sem perfil', users_without_profile;
    
    -- Criar perfis para usuários existentes sem perfil
    FOR user_record IN 
        SELECT u.* 
        FROM auth.users u
        LEFT JOIN profiles p ON u.id = p.id
        WHERE p.id IS NULL
        LIMIT 10 -- Limitar para evitar timeout
    LOOP
        BEGIN
            -- Simular trigger para usuários existentes
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
                COALESCE(user_record.email, ''),
                COALESCE(
                    SPLIT_PART(
                        COALESCE(
                            user_record.raw_user_meta_data->>'full_name',
                            user_record.raw_user_meta_data->>'name',
                            SPLIT_PART(user_record.email, '@', 1)
                        ), ' ', 1
                    ), ''
                ),
                CASE 
                    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(
                        COALESCE(
                            user_record.raw_user_meta_data->>'full_name',
                            user_record.raw_user_meta_data->>'name',
                            ''
                        ), ' '
                    ), 1) > 1 
                    THEN TRIM(SUBSTRING(
                        COALESCE(
                            user_record.raw_user_meta_data->>'full_name',
                            user_record.raw_user_meta_data->>'name',
                            ''
                        ) FROM POSITION(' ' IN COALESCE(
                            user_record.raw_user_meta_data->>'full_name',
                            user_record.raw_user_meta_data->>'name',
                            ''
                        )) + 1
                    ))
                    ELSE ''
                END,
                COALESCE(
                    user_record.raw_user_meta_data->>'avatar_url',
                    user_record.raw_user_meta_data->>'picture',
                    NULL
                ),
                'affiliate'::user_role,
                'pending'::affiliate_status,
                10.00,
                0.00,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '✅ Perfil criado para usuário existente: %', user_record.email;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Erro ao criar perfil para %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
END $$;

-- 6. VERIFICAÇÃO FINAL
DO $$
DECLARE
    total_users INTEGER;
    total_profiles INTEGER;
    users_without_profile INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    SELECT COUNT(*) INTO users_without_profile
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE '📊 RELATÓRIO FINAL:';
    RAISE NOTICE '   - Total de usuários: %', total_users;
    RAISE NOTICE '   - Total de perfis: %', total_profiles;
    RAISE NOTICE '   - Usuários sem perfil: %', users_without_profile;
    
    IF users_without_profile = 0 THEN
        RAISE NOTICE '🎉 SUCESSO: Todos os usuários têm perfis!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: % usuários ainda sem perfil', users_without_profile;
    END IF;
END $$; 