-- =====================================================
-- CORREÇÃO SUPABASE HOSPEDADO: Storage Policies
-- Data: 2025-01-30
-- Versão: Compatível com permissões limitadas
-- =====================================================

-- NOTA: No Supabase hospedado, algumas operações de storage precisam ser feitas pela interface
-- Este script foca apenas no que podemos fazer via SQL

-- 1. VERIFICAR STATUS ATUAL DOS BUCKETS
SELECT 'VERIFICAÇÃO: Status atual dos buckets' as info;

SELECT 
  id as bucket,
  public as publico,
  file_size_limit as limite_mb,
  allowed_mime_types as tipos_permitidos,
  created_at
FROM storage.buckets 
WHERE id IN ('products', 'avatars', 'courses', 'uploads')
ORDER BY id;

-- 2. VERIFICAR POLÍTICAS EXISTENTES  
SELECT 'VERIFICAÇÃO: Políticas existentes' as info;

SELECT 
  policyname as politica,
  cmd as operacao,
  CASE 
    WHEN qual LIKE '%products%' THEN '🏪 PRODUCTS'
    WHEN qual LIKE '%avatars%' THEN '👤 AVATARS' 
    WHEN qual LIKE '%courses%' THEN '📚 COURSES'
    WHEN qual LIKE '%uploads%' THEN '📁 UPLOADS'
    ELSE '❓ OUTROS'
  END as bucket_tipo
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY bucket_tipo, cmd;

-- 3. VERIFICAR SEU PERFIL E PERMISSÕES
SELECT 'VERIFICAÇÃO: Seu perfil e permissões' as info;

SELECT 
  id as user_id,
  email,
  role,
  affiliate_status,
  CASE 
    WHEN role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]) 
    THEN '✅ É ADMIN - Pode fazer upload em products'
    ELSE '❌ NÃO é admin - Apenas avatars'
  END as status_permissao,
  created_at,
  onboarding_completed_at
FROM profiles 
WHERE id = auth.uid();

-- 4. VERIFICAR SE EXISTE POLÍTICA INSERT PARA PRODUCTS
SELECT 'VERIFICAÇÃO: Política INSERT para products' as info;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND cmd = 'INSERT'
      AND qual LIKE '%products%'
    ) 
    THEN '✅ Política INSERT para products EXISTE'
    ELSE '❌ Política INSERT para products NÃO EXISTE'
  END as status_products;

-- 5. VERIFICAR SE EXISTE POLÍTICA INSERT PARA AVATARS
SELECT 'VERIFICAÇÃO: Política INSERT para avatars' as info;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND cmd = 'INSERT' 
      AND qual LIKE '%avatars%'
    ) 
    THEN '✅ Política INSERT para avatars EXISTE'
    ELSE '❌ Política INSERT para avatars NÃO EXISTE'
  END as status_avatars;

-- 6. INSTRUÇÕES PARA CORRIGIR VIA INTERFACE
SELECT 'INSTRUÇÕES: Como corrigir via interface do Supabase' as info;

SELECT '1. Acesse: Dashboard > Storage > Policies' as passo_1;
SELECT '2. Clique em "New Policy" na tabela objects' as passo_2;
SELECT '3. Escolha "Custom" para criar política personalizada' as passo_3;
SELECT '4. Configure as políticas conforme próximas instruções' as passo_4;

-- 7. TEMPLATE PARA POLÍTICA DE PRODUCTS (COPY/PASTE na interface)
SELECT '=== POLÍTICA 1: Products Upload (Cole na interface) ===' as template_1;

SELECT 'Nome da Política: products_upload_by_admins' as nome_1;
SELECT 'Operação: INSERT' as operacao_1;
SELECT 'Target roles: authenticated' as target_1;
SELECT 'Policy definition (USING): true' as using_1;
SELECT 'Policy check (WITH CHECK):' as check_label_1;
SELECT 'bucket_id = ''products'' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY(ARRAY[''admin''::user_role, ''super_admin''::user_role]))' as check_1;

-- 8. TEMPLATE PARA POLÍTICA DE AVATARS (COPY/PASTE na interface)
SELECT '=== POLÍTICA 2: Avatars Upload (Cole na interface) ===' as template_2;

SELECT 'Nome da Política: avatars_upload_by_users' as nome_2;
SELECT 'Operação: INSERT' as operacao_2;
SELECT 'Target roles: authenticated' as target_2;
SELECT 'Policy definition (USING): true' as using_2;
SELECT 'Policy check (WITH CHECK):' as check_label_2;
SELECT 'bucket_id = ''avatars''.' as check_2;

-- 9. VERIFICAÇÃO FINAL
SELECT '=== RESUMO DO QUE VOCÊ PRECISA FAZER ===' as resumo;

SELECT 'Se as políticas INSERT não existem, crie via interface' as acao_1;
SELECT 'Se os buckets não são públicos, marque como público' as acao_2;
SELECT 'Se não é admin, promova seu usuário para admin' as acao_3;
SELECT 'Execute novamente este script para verificar' as acao_4;

-- 10. COMANDO PARA PROMOVER USUÁRIO (se necessário)
SELECT '=== SE NECESSÁRIO: Promover usuário para admin ===' as promocao;

-- Este comando SIM podemos executar:
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE id = auth.uid()
AND role NOT IN ('admin', 'super_admin');

SELECT 
  CASE 
    WHEN role = 'admin'::user_role THEN '✅ Usuário promovido para ADMIN com sucesso!'
    ELSE '⚠️ Usuário já era admin ou não foi alterado'
  END as resultado_promocao
FROM profiles 
WHERE id = auth.uid(); 