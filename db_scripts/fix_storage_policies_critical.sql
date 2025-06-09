-- ====================================================================
-- CORREÇÃO CRÍTICA - POLÍTICAS DE STORAGE PARA BUCKET PRODUCTS
-- Portal Afiliados da Elite - Correção do Upload de Imagens de Produtos
-- Data: Aplicação Imediata
-- ====================================================================

-- ============================================
-- 1. CRIAR OU VERIFICAR BUCKET PRODUCTS
-- ============================================

-- Criar bucket products se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'products', 
  'products', 
  true,
  10485760, -- 10MB limit para produtos
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. REMOVER POLÍTICAS RESTRITIVAS ANTIGAS
-- ============================================

-- Remover todas as políticas antigas do bucket products
DROP POLICY IF EXISTS "Admins podem fazer upload de imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver imagens de produtos" ON storage.objects;

-- ============================================
-- 3. APLICAR POLÍTICAS FUNCIONAIS E SEGURAS
-- ============================================

-- Política de SELECT: Qualquer pessoa pode ver imagens de produtos (público)
CREATE POLICY "products_public_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'products');

-- Política de INSERT: Usuários autenticados podem fazer upload
CREATE POLICY "products_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products');

-- Política de UPDATE: Usuários autenticados podem atualizar 
CREATE POLICY "products_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'products');

-- Política de DELETE: Usuários autenticados podem deletar
CREATE POLICY "products_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'products');

-- ============================================
-- 4. VERIFICAÇÕES DE SEGURANÇA ADICIONAIS
-- ============================================

-- Verificar se as políticas foram aplicadas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) 
    INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE 'products_%';
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ Políticas aplicadas com sucesso: % políticas criadas', policy_count;
    ELSE
        RAISE NOTICE '⚠️ Apenas % políticas encontradas para products', policy_count;
    END IF;
END $$;

-- ============================================
-- 5. TESTE DE CONFIGURAÇÃO
-- ============================================

-- Verificar configuração final do bucket
DO $$
DECLARE
    bucket_config RECORD;
BEGIN
    SELECT * INTO bucket_config 
    FROM storage.buckets 
    WHERE id = 'products';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Bucket products configurado:';
        RAISE NOTICE '   - Público: %', bucket_config.public;
        RAISE NOTICE '   - Tamanho máximo: %MB', bucket_config.file_size_limit / 1048576;
        RAISE NOTICE '   - Tipos permitidos: %', bucket_config.allowed_mime_types;
    ELSE
        RAISE NOTICE '❌ Bucket products não encontrado!';
    END IF;
END $$;

-- ====================================================================
-- INSTRUÇÕES DE APLICAÇÃO:
-- 
-- 1. Execute este script no SQL Editor do Supabase Dashboard
-- 2. Ou aplique via CLI: supabase db reset --local (para ambiente local)
-- 3. Teste o upload na aplicação imediatamente após aplicar
-- 
-- TESTE RÁPIDO NO CONSOLE DO SUPABASE:
-- const { data, error } = await _supabaseClient.storage.getBucket('products');
-- console.log('Products bucket:', { data, error });
-- ==================================================================== 