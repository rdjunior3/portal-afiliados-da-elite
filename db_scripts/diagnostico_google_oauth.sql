-- 🔍 DIAGNÓSTICO GOOGLE OAUTH - CADASTRO DE NOVOS USUÁRIOS
-- Execute este script no Supabase para diagnosticar problemas

-- 1. Verificar usuários recentes
SELECT 
    'USUÁRIOS RECENTES' as secao,
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    i.provider,
    i.provider_id,
    i.identity_data->>'email' as google_email,
    i.identity_data->>'name' as google_name
FROM auth.users u 
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.created_at >= NOW() - INTERVAL '30 days'
OR u.last_sign_in_at >= NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;

-- 2. Verificar tentativas de login Google (últimos 7 dias)
SELECT 
    'IDENTITIES GOOGLE' as secao,
    COUNT(*) as total_google_users,
    MAX(created_at) as ultimo_cadastro_google,
    MIN(created_at) as primeiro_cadastro_google
FROM auth.identities 
WHERE provider = 'google';

-- 3. Verificar perfis criados para usuários Google
SELECT 
    'PERFIS GOOGLE' as secao,
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    u.email as auth_email,
    i.provider,
    i.identity_data->>'name' as google_name
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE i.provider = 'google'
ORDER BY p.created_at DESC;

-- 4. Verificar usuários sem perfil (problema comum)
SELECT 
    'USUÁRIOS SEM PERFIL' as secao,
    u.id,
    u.email,
    u.created_at,
    i.provider
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 5. Estatísticas gerais
SELECT 
    'ESTATÍSTICAS GERAIS' as secao,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM auth.identities WHERE provider = 'google') as usuarios_google,
    (SELECT COUNT(*) FROM public.profiles) as total_perfis,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days') as usuarios_ultimos_7_dias;

-- 6. Verificar estrutura das tabelas críticas
SELECT 
    'ESTRUTURA AUTH.USERS' as secao,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name IN ('id', 'email', 'created_at', 'email_confirmed_at')
ORDER BY ordinal_position;

-- 7. Verificar estrutura das identities
SELECT 
    'ESTRUTURA AUTH.IDENTITIES' as secao,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'identities'
AND column_name IN ('id', 'user_id', 'provider', 'provider_id', 'identity_data')
ORDER BY ordinal_position;

-- 8. Verificar últimas tentativas de autenticação
SELECT 
    'ÚLTIMOS LOGINS' as secao,
    u.email,
    u.last_sign_in_at,
    i.provider,
    i.last_sign_in_at as provider_last_signin
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.last_sign_in_at IS NOT NULL
ORDER BY u.last_sign_in_at DESC
LIMIT 10; 