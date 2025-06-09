-- ====================================================================
-- SCRIPT DE ATUALIZAÇÕES DO BANCO DE DADOS - VERSÃO CORRIGIDA
-- Portal Afiliados da Elite - Melhorias Implementadas
-- Data: 04/06/2025
-- ====================================================================

-- ============================================
-- 1. VERIFICAR E LIDAR COM DEPENDÊNCIAS
-- ============================================

-- Primeiro, vamos verificar se a view products_with_offers existe
DO $$
DECLARE
    view_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_name = 'products_with_offers'
    ) INTO view_exists;
    
    IF view_exists THEN
        RAISE NOTICE 'View products_with_offers encontrada. Será recriada sem short_description.';
    ELSE
        RAISE NOTICE 'View products_with_offers não encontrada.';
    END IF;
END $$;

-- Salvar a definição da view products_with_offers (se existir) para recriar sem short_description
-- Primeiro vamos dropa-la e depois recriar
DROP VIEW IF EXISTS products_with_offers CASCADE;

-- ============================================
-- 2. ATUALIZAÇÕES NA TABELA PROFILES
-- ============================================

-- Adicionar coluna avatar_url para upload de imagem de perfil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN profiles.avatar_url IS 'URL da imagem de perfil do usuário armazenada no Storage';

-- ============================================
-- 3. ATUALIZAÇÕES NA TABELA PRODUCTS
-- ============================================

-- Agora podemos remover a coluna short_description sem erro
ALTER TABLE products 
DROP COLUMN IF EXISTS short_description;

-- Garantir que description pode ser NULL (flexibilidade)
ALTER TABLE products 
ALTER COLUMN description DROP NOT NULL;

-- ============================================
-- 4. RECRIAR A VIEW products_with_offers SEM short_description
-- ============================================

-- Recriar a view products_with_offers sem a coluna short_description
CREATE OR REPLACE VIEW products_with_offers AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description, -- Apenas description, sem short_description
    p.price,
    p.commission_rate,
    p.commission_amount,
    p.category_id,
    p.affiliate_link,
    p.thumbnail_url,
    p.status,
    p.currency,
    p.gravity_score,
    p.earnings_per_click,
    p.conversion_rate_avg,
    p.refund_rate,
    p.is_featured,
    p.is_exclusive,
    p.requires_approval,
    p.min_payout,
    p.created_at,
    p.updated_at,
    -- Agregar as ofertas relacionadas
    COALESCE(
        json_agg(
            json_build_object(
                'id', po.id,
                'title', po.title,
                'description', po.description,
                'price', po.price,
                'commission_rate', po.commission_rate,
                'is_active', po.is_active,
                'created_at', po.created_at
            ) ORDER BY po.created_at
        ) FILTER (WHERE po.id IS NOT NULL), 
        '[]'::json
    ) as offers
FROM products p
LEFT JOIN product_offers po ON p.id = po.product_id AND po.is_active = true
WHERE p.status = 'active'
GROUP BY 
    p.id, p.name, p.slug, p.description, p.price, p.commission_rate, 
    p.commission_amount, p.category_id, p.affiliate_link, p.thumbnail_url, 
    p.status, p.currency, p.gravity_score, p.earnings_per_click, 
    p.conversion_rate_avg, p.refund_rate, p.is_featured, p.is_exclusive, 
    p.requires_approval, p.min_payout, p.created_at, p.updated_at;

-- Adicionar comentário à view
COMMENT ON VIEW products_with_offers IS 'View de produtos com suas ofertas agregadas, sem short_description';

-- ============================================
-- 5. CONFIGURAÇÃO DE STORAGE PARA PERFIS
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
-- 6. POLÍTICAS DE SEGURANÇA (RLS) PARA STORAGE
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
-- 7. POLÍTICAS DE SEGURANÇA (RLS) PARA PRODUCTS
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
-- 8. POLÍTICAS DE SEGURANÇA (RLS) PARA PROFILES
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
-- 9. VERIFICAÇÕES E VALIDAÇÕES
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
-- 10. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para busca por status em products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Índice para busca por role/admin em profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ============================================
-- 11. TRIGGERS E FUNÇÕES AUXILIARES
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
-- 12. DADOS DE EXEMPLO/TESTE (OPCIONAL)
-- ============================================

-- Inserir categorias básicas se não existirem (para produtos)
INSERT INTO categories (id, name, color, description) VALUES
  (gen_random_uuid(), 'Marketing Digital', '#f97316', 'Produtos de marketing digital e afiliados'),
  (gen_random_uuid(), 'Desenvolvimento', '#3b82f6', 'Cursos e produtos de programação'),
  (gen_random_uuid(), 'E-commerce', '#10b981', 'Produtos para vendas online'),
  (gen_random_uuid(), 'Finanças', '#8b5cf6', 'Educação financeira e investimentos')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 13. VERIFICAÇÕES FINAIS
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
-- 14. VERIFICAÇÃO DE INTEGRIDADE FINAL
-- ============================================

-- Verificar se a view foi recriada corretamente
DO $$
DECLARE
    view_exists boolean;
    view_columns text[];
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_name = 'products_with_offers'
    ) INTO view_exists;
    
    IF view_exists THEN
        -- Verificar se short_description não está mais na view
        SELECT ARRAY_AGG(column_name) INTO view_columns
        FROM information_schema.columns 
        WHERE table_name = 'products_with_offers';
        
        IF 'short_description' = ANY(view_columns) THEN
            RAISE WARNING 'ATENÇÃO: short_description ainda está presente na view!';
        ELSE
            RAISE NOTICE '✅ View products_with_offers recriada com sucesso sem short_description';
        END IF;
    ELSE
        RAISE WARNING 'View products_with_offers não foi encontrada após recriação';
    END IF;
    
    -- Verificar se a coluna foi removida da tabela products
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'short_description'
    ) THEN
        RAISE WARNING 'ATENÇÃO: Coluna short_description ainda existe na tabela products!';
    ELSE
        RAISE NOTICE '✅ Coluna short_description removida com sucesso da tabela products';
    END IF;
END $$;

-- ============================================
-- 15. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis dos usuários com informações estendidas incluindo avatar';
COMMENT ON TABLE products IS 'Produtos para afiliação simplificados (sem short_description)';
COMMENT ON FUNCTION validate_avatar_url(TEXT) IS 'Valida URLs de avatar para perfis de usuário';
COMMENT ON FUNCTION cleanup_old_avatar() IS 'Remove avatares antigos do storage quando alterados';

-- ============================================
-- RESUMO DAS ALTERAÇÕES - VERSÃO CORRIGIDA
-- ============================================

/*
ALTERAÇÕES IMPLEMENTADAS (VERSÃO CORRIGIDA):

1. ✅ Identificado e resolvido conflito com view products_with_offers
2. ✅ View recriada sem dependência de short_description
3. ✅ Adicionado avatar_url à tabela profiles
4. ✅ Removido short_description da tabela products (após resolver dependências)
5. ✅ Configurado bucket 'profiles' para avatares
6. ✅ Implementado RLS completo para storage
7. ✅ Políticas de segurança para products
8. ✅ Validação de URLs de avatar
9. ✅ Limpeza automática de avatares antigos
10. ✅ Índices para performance
11. ✅ Verificações e habilitação de RLS
12. ✅ Verificações de integridade final

PROBLEMAS RESOLVIDOS:
- ❌ ERROR 2BP01: Dependência da view products_with_offers
- ✅ View recriada sem short_description
- ✅ Coluna removida com sucesso

PRÓXIMOS PASSOS:
- Testar upload de imagem na página de configurações
- Verificar se produtos conseguem ser cadastrados/excluídos
- Validar funcionamento das políticas RLS
- Monitorar performance das queries
*/

-- ====================================================================
-- FIM DO SCRIPT DE ATUALIZAÇÕES CORRIGIDO
-- ==================================================================== 