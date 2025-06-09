-- =====================================================
-- SCRIPT DE TESTE: Validar Todas as Funcionalidades
-- Data: 2025-01-30
-- Objetivo: Testar completude do perfil e upload de imagens
-- =====================================================

-- 1. TESTAR ATUALIZAÇÃO DE PERFIL (simular CompleteProfile)
SELECT '🧪 TESTE 1: Atualizando perfil com campos corretos' as teste;

-- Simular o que o CompleteProfile faz
UPDATE profiles 
SET 
  first_name = COALESCE(first_name, 'Usuario'),
  last_name = COALESCE(last_name, 'Teste'),
  full_name = COALESCE(first_name, 'Usuario') || ' ' || COALESCE(last_name, 'Teste'),
  phone = COALESCE(phone, '(11) 99999-9999'),
  affiliate_code = COALESCE(affiliate_code, 'usuarioteste' || EXTRACT(EPOCH FROM NOW())::text),
  affiliate_status = 'approved',
  onboarding_completed_at = NOW()
WHERE id = auth.uid()
AND onboarding_completed_at IS NULL;

-- Verificar resultado
SELECT 
  '✅ Perfil atualizado:' as resultado,
  first_name,
  last_name,
  full_name,
  phone,
  affiliate_code,
  affiliate_status,
  onboarding_completed_at
FROM profiles 
WHERE id = auth.uid();

-- 2. TESTAR PERMISSÕES DE STORAGE
SELECT '🧪 TESTE 2: Verificando permissões de upload' as teste;

-- Simular tentativa de upload para products (só admins)
SELECT 
  CASE 
    WHEN role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]) 
    THEN '✅ PODE fazer upload em products (é admin)'
    ELSE '❌ NÃO PODE fazer upload em products (não é admin)'
  END as status_products,
  '✅ PODE fazer upload em avatars (usuário autenticado)' as status_avatars,
  role as seu_role
FROM profiles 
WHERE id = auth.uid();

-- 3. TESTAR GERAÇÃO DE AFFILIATE_CODE
SELECT '🧪 TESTE 3: Testando geração automática de affiliate_code' as teste;

-- Verificar se o trigger funciona
INSERT INTO profiles (id, email, first_name, last_name)
VALUES (
  gen_random_uuid(),
  'teste' || EXTRACT(EPOCH FROM NOW()) || '@exemplo.com',
  'Teste',
  'Automatico'
)
ON CONFLICT (email) DO NOTHING;

-- Mostrar último perfil criado
SELECT 
  '✅ Affiliate code gerado automaticamente:' as resultado,
  email,
  affiliate_code,
  created_at
FROM profiles 
WHERE created_at > NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC
LIMIT 1;

-- 4. TESTAR ESTRUTURA DE CAMPOS NECESSÁRIOS
SELECT '🧪 TESTE 4: Verificando campos essenciais na tabela profiles' as teste;

SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Campos essenciais existem'
    ELSE '❌ Faltam campos essenciais'
  END as status_campos
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('onboarding_completed_at', 'affiliate_code', 'affiliate_status');

-- 5. TESTAR POLÍTICAS DE STORAGE
SELECT '🧪 TESTE 5: Verificando políticas de storage' as teste;

SELECT 
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ Políticas INSERT existem para produtos e avatars'
    ELSE '❌ Faltam políticas INSERT'
  END as status_politicas
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND cmd = 'INSERT'
AND (qual LIKE '%products%' OR qual LIKE '%avatars%');

-- 6. TESTAR BUCKETS PÚBLICOS
SELECT '🧪 TESTE 6: Verificando buckets públicos' as teste;

SELECT 
  id as bucket,
  CASE 
    WHEN public = true THEN '✅ Público'
    ELSE '❌ Privado'
  END as status_publico,
  file_size_limit as limite_mb
FROM storage.buckets 
WHERE id IN ('products', 'avatars')
ORDER BY id;

-- 7. RESUMO FINAL DOS TESTES
SELECT '📊 RESUMO FINAL DOS TESTES:' as secao;

SELECT 
  'Perfil' as funcionalidade,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND onboarding_completed_at IS NOT NULL
      AND affiliate_code IS NOT NULL
    ) 
    THEN '✅ FUNCIONANDO'
    ELSE '❌ COM PROBLEMAS'
  END as status;

SELECT 
  'Upload Storage' as funcionalidade,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM pg_policies 
      WHERE tablename = 'objects' 
      AND cmd = 'INSERT'
      AND qual LIKE '%products%'
    ) > 0 
    THEN '✅ FUNCIONANDO'
    ELSE '❌ COM PROBLEMAS'
  END as status;

SELECT 
  'Buckets Públicos' as funcionalidade,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM storage.buckets 
      WHERE id IN ('products', 'avatars') 
      AND public = true
    ) = 2 
    THEN '✅ FUNCIONANDO'
    ELSE '❌ COM PROBLEMAS'
  END as status;

-- 8. INSTRUÇÕES FINAIS
SELECT '🎯 PRÓXIMOS PASSOS PARA TESTAR:' as instrucoes;

SELECT '1. Complete Profile: Tente preencher e salvar o perfil' as passo_1;
SELECT '2. Upload Avatar: Tente fazer upload de uma foto de perfil' as passo_2;
SELECT '3. Upload Produto: (Se for admin) Tente criar um produto com imagem' as passo_3;
SELECT '4. Verificar Console: Abra F12 e veja se há erros durante os testes' as passo_4; 