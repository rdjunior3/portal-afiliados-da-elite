-- Script para verificar e garantir permissões de admin para o usuário 04junior.silva09@gmail.com

-- 1. Verificar usuário atual
SELECT id, email, role, affiliate_status, created_at, updated_at
FROM profiles 
WHERE email = '04junior.silva09@gmail.com';

-- 2. Promover usuário para super_admin (se necessário)
UPDATE profiles 
SET 
  role = 'super_admin',
  affiliate_status = 'approved',
  affiliate_id = 'ADMIN-001',
  commission_rate = 50.00,
  updated_at = NOW()
WHERE email = '04junior.silva09@gmail.com';

-- 3. Verificar se foi atualizado
SELECT id, email, role, affiliate_status, affiliate_id, commission_rate
FROM profiles 
WHERE email = '04junior.silva09@gmail.com';

-- 4. Verificar todos os administradores
SELECT email, role, affiliate_status, affiliate_id, created_at
FROM profiles 
WHERE role IN ('admin', 'super_admin', 'moderator')
ORDER BY role DESC, created_at ASC;

-- 5. Verificar estrutura da tabela profiles
\d profiles; 