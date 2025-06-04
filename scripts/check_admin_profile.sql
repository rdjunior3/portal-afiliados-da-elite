-- ========================================
-- Verificar Perfil de Admin do Usuário
-- ========================================

-- 1. Verificar seu próprio perfil
SELECT 
    email,
    first_name,
    last_name,
    role,
    affiliate_status,
    CASE 
        WHEN role IN ('admin', 'super_admin', 'moderator') 
        THEN '✅ Você tem acesso admin'
        ELSE '❌ Você é afiliado comum'
    END as status_admin
FROM profiles 
WHERE id = auth.uid();

-- 2. Se você não tiver admin, atualizar para admin (use seu email)
-- DESCOMENTE A LINHA ABAIXO E SUBSTITUA SEU EMAIL:
-- UPDATE profiles SET role = 'admin' WHERE email = 'seu-email@exemplo.com';

-- 3. Verificar todos os admins no sistema
SELECT 
    email,
    role,
    affiliate_status,
    created_at
FROM profiles 
WHERE role IN ('admin', 'super_admin', 'moderator')
ORDER BY created_at;

-- 4. Verificar quantos usuários existem por role
SELECT 
    role,
    COUNT(*) as total
FROM profiles 
GROUP BY role
ORDER BY total DESC; 