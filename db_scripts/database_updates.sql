-- ====================================================================
-- SCRIPT DE ATUALIZAÇÕES DO BANCO DE DADOS
-- Portal Afiliados da Elite - Melhorias Implementadas
-- Data: 04/06/2025
-- ====================================================================

-- ============================================
-- 1. ATUALIZAÇÕES NA TABELA PROFILES
-- ============================================

-- Adicionar coluna avatar_url para upload de imagem de perfil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN profiles.avatar_url IS 'URL da imagem de perfil do usuário armazenada no Storage';

-- ============================================
-- 2. ATUALIZAÇÕES NA TABELA PRODUCTS
-- ============================================

-- Remover coluna short_description (simplificação conforme solicitado)
ALTER TABLE products 
DROP COLUMN IF EXISTS short_description;

-- Garantir que description pode ser NULL (flexibilidade)
ALTER TABLE products 
ALTER COLUMN description DROP NOT NULL;

-- ============================================
-- 3. CONFIGURAÇÃO DE STORAGE PARA PERFIS
-- ============================================

-- Criar bucket para avatares de perfil se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profiles', 
  'profiles', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 4. POLÍTICAS DE SEGURANÇA (RLS) PARA STORAGE
-- ============================================

-- Policy para usuários fazerem upload de seus próprios avatares
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy para usuários atualizarem seus próprios avatares
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy para usuários excluírem seus próprios avatares
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy para acesso público de leitura aos avatares
DROP POLICY IF EXISTS "Public access to profile avatars" ON storage.objects;
CREATE POLICY "Public access to profile avatars" ON storage.objects
FOR SELECT TO public
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- ============================================
-- 5. POLÍTICAS DE SEGURANÇA (RLS) PARA PRODUCTS
-- ============================================

-- Verificar e criar policy para admins gerenciarem produtos
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.is_admin = true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.is_admin = true)
  )
);

-- Policy para usuários visualizarem produtos ativos
DROP POLICY IF EXISTS "Users can view active products" ON products;
CREATE POLICY "Users can view active products" ON products
FOR SELECT TO authenticated
USING (status = 'active' OR status IS NULL);

-- ============================================
-- 6. POLÍTICAS DE SEGURANÇA (RLS) PARA PROFILES
-- ============================================

-- Policy para usuários atualizarem seus próprios perfis
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy para usuários visualizarem perfis (necessário para sistema)
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT TO authenticated
USING (true);

-- ============================================
-- 7. VERIFICAÇÕES E VALIDAÇÕES
-- ============================================

-- Função para validar URL do avatar
CREATE OR REPLACE FUNCTION validate_avatar_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Se é NULL, está ok
  IF url IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se é uma URL válida do storage do Supabase
  IF url ~ '^https://[a-zA-Z0-9-]+\.supabase\.co/storage/v1/object/public/profiles/avatars/.+' THEN
    RETURN TRUE;
  END IF;
  
  -- Ou uma URL externa válida (para flexibilidade)
  IF url ~ '^https?://.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Adicionar constraint de validação para avatar_url
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_avatar_url;

ALTER TABLE profiles 
ADD CONSTRAINT valid_avatar_url 
CHECK (validate_avatar_url(avatar_url));

-- ============================================
-- 8. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para busca por status em products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Índice para busca por role/admin em profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ============================================
-- 9. TRIGGERS E FUNÇÕES AUXILIARES
-- ============================================

-- Função para limpar avatar antigo quando um novo é salvo
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
  old_path TEXT;
  old_file_name TEXT;
BEGIN
  -- Se há um avatar antigo e está sendo alterado
  IF OLD.avatar_url IS NOT NULL 
     AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url 
     AND OLD.avatar_url LIKE '%supabase.co/storage%' THEN
    
    -- Extrair o nome do arquivo do path antigo
    old_path := substring(OLD.avatar_url from '/storage/v1/object/public/profiles/(.+)$');
    
    IF old_path IS NOT NULL THEN
      -- Deletar o arquivo antigo do storage
      DELETE FROM storage.objects 
      WHERE bucket_id = 'profiles' AND name = old_path;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpar avatar antigo
DROP TRIGGER IF EXISTS trigger_cleanup_old_avatar ON profiles;
CREATE TRIGGER trigger_cleanup_old_avatar
  AFTER UPDATE OF avatar_url ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_avatar();

-- ============================================
-- 10. DADOS DE EXEMPLO/TESTE (OPCIONAL)
-- ============================================

-- Inserir categorias básicas se não existirem (para produtos)
INSERT INTO categories (id, name, color, description) VALUES
  (gen_random_uuid(), 'Marketing Digital', '#f97316', 'Produtos de marketing digital e afiliados'),
  (gen_random_uuid(), 'Desenvolvimento', '#3b82f6', 'Cursos e produtos de programação'),
  (gen_random_uuid(), 'E-commerce', '#10b981', 'Produtos para vendas online'),
  (gen_random_uuid(), 'Finanças', '#8b5cf6', 'Educação financeira e investimentos')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 11. VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar se RLS está habilitado nas tabelas críticas
DO $$
BEGIN
  -- Verificar e habilitar RLS se necessário
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para tabela profiles';
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'products') THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para tabela products';
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'storage.objects') THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para tabela storage.objects';
  END IF;
END $$;

-- ============================================
-- 12. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis dos usuários com informações estendidas incluindo avatar';
COMMENT ON TABLE products IS 'Produtos para afiliação simplificados (sem short_description)';
COMMENT ON FUNCTION validate_avatar_url(TEXT) IS 'Valida URLs de avatar para perfis de usuário';
COMMENT ON FUNCTION cleanup_old_avatar() IS 'Remove avatares antigos do storage quando alterados';

-- ============================================
-- RESUMO DAS ALTERAÇÕES
-- ============================================

/*
ALTERAÇÕES IMPLEMENTADAS:

1. ✅ Adicionado avatar_url à tabela profiles
2. ✅ Removido short_description da tabela products  
3. ✅ Configurado bucket 'profiles' para avatares
4. ✅ Implementado RLS completo para storage
5. ✅ Políticas de segurança para products
6. ✅ Validação de URLs de avatar
7. ✅ Limpeza automática de avatares antigos
8. ✅ Índices para performance
9. ✅ Verificações e habilitação de RLS

PRÓXIMOS PASSOS:
- Testar upload de imagem na página de configurações
- Verificar permissões de admin para produtos
- Validar funcionamento das políticas RLS
- Monitorar performance das queries
*/

-- ====================================================================
-- FIM DO SCRIPT DE ATUALIZAÇÕES
-- ==================================================================== 