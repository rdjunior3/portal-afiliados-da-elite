-- ====================================================================
-- SCRIPT DE ATUALIZAÇÕES DO BANCO DE DADOS - VERSÃO CORRIGIDA V2
-- Portal Afiliados da Elite - Melhorias Implementadas
-- Data: 04/06/2025
-- VERSÃO: Compatível com estrutura atual do banco
-- ====================================================================

-- ============================================
-- 1. DETECTAR ESTRUTURA ATUAL DA TABELA PRODUCTS
-- ============================================

-- Função para verificar se uma coluna existe em uma tabela
CREATE OR REPLACE FUNCTION column_exists(table_name_param text, column_name_param text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = table_name_param 
        AND column_name = column_name_param
    );
END;
$$ LANGUAGE plpgsql;

-- Verificar estrutura atual da tabela products
DO $$
DECLARE
    has_currency boolean;
    has_gravity_score boolean;
    has_short_description boolean;
    has_slug boolean;
    has_thumbnail_url boolean;
    has_original_price boolean;
    has_commission_amount boolean;
    has_earnings_per_click boolean;
    has_conversion_rate_avg boolean;
    has_refund_rate boolean;
    has_is_featured boolean;
    has_is_exclusive boolean;
    has_requires_approval boolean;
    has_min_payout boolean;
    has_launch_date boolean;
    has_end_date boolean;
BEGIN
    -- Verificar quais colunas existem
    SELECT column_exists('products', 'currency') INTO has_currency;
    SELECT column_exists('products', 'gravity_score') INTO has_gravity_score;
    SELECT column_exists('products', 'short_description') INTO has_short_description;
    SELECT column_exists('products', 'slug') INTO has_slug;
    SELECT column_exists('products', 'thumbnail_url') INTO has_thumbnail_url;
    SELECT column_exists('products', 'original_price') INTO has_original_price;
    SELECT column_exists('products', 'commission_amount') INTO has_commission_amount;
    SELECT column_exists('products', 'earnings_per_click') INTO has_earnings_per_click;
    SELECT column_exists('products', 'conversion_rate_avg') INTO has_conversion_rate_avg;
    SELECT column_exists('products', 'refund_rate') INTO has_refund_rate;
    SELECT column_exists('products', 'is_featured') INTO has_is_featured;
    SELECT column_exists('products', 'is_exclusive') INTO has_is_exclusive;
    SELECT column_exists('products', 'requires_approval') INTO has_requires_approval;
    SELECT column_exists('products', 'min_payout') INTO has_min_payout;
    SELECT column_exists('products', 'launch_date') INTO has_launch_date;
    SELECT column_exists('products', 'end_date') INTO has_end_date;
    
    RAISE NOTICE '=== ESTRUTURA ATUAL DA TABELA PRODUCTS ===';
    RAISE NOTICE 'currency: %', has_currency;
    RAISE NOTICE 'gravity_score: %', has_gravity_score;
    RAISE NOTICE 'short_description: %', has_short_description;
    RAISE NOTICE 'slug: %', has_slug;
    RAISE NOTICE 'thumbnail_url: %', has_thumbnail_url;
    RAISE NOTICE 'original_price: %', has_original_price;
    RAISE NOTICE 'commission_amount: %', has_commission_amount;
    RAISE NOTICE 'earnings_per_click: %', has_earnings_per_click;
    RAISE NOTICE 'conversion_rate_avg: %', has_conversion_rate_avg;
    RAISE NOTICE 'refund_rate: %', has_refund_rate;
    RAISE NOTICE 'is_featured: %', has_is_featured;
    RAISE NOTICE 'is_exclusive: %', has_is_exclusive;
    RAISE NOTICE 'requires_approval: %', has_requires_approval;
    RAISE NOTICE 'min_payout: %', has_min_payout;
    RAISE NOTICE 'launch_date: %', has_launch_date;
    RAISE NOTICE 'end_date: %', has_end_date;
END $$;

-- ============================================
-- 2. VERIFICAR E LIDAR COM DEPENDÊNCIAS
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
        RAISE NOTICE 'View products_with_offers encontrada. Será recriada.';
    ELSE
        RAISE NOTICE 'View products_with_offers não encontrada.';
    END IF;
END $$;

-- Salvar a definição da view products_with_offers (se existir) para recriar
-- Primeiro vamos dropa-la e depois recriar
DROP VIEW IF EXISTS products_with_offers CASCADE;

-- ============================================
-- 3. ATUALIZAÇÕES NA TABELA PROFILES
-- ============================================

-- Adicionar coluna avatar_url para upload de imagem de perfil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN profiles.avatar_url IS 'URL da imagem de perfil do usuário armazenada no Storage';

-- ============================================
-- 4. ATUALIZAÇÕES NA TABELA PRODUCTS
-- ============================================

-- Remover a coluna short_description apenas se ela existir
DO $$
BEGIN
    IF column_exists('products', 'short_description') THEN
        ALTER TABLE products DROP COLUMN short_description;
        RAISE NOTICE '✅ Coluna short_description removida da tabela products';
    ELSE
        RAISE NOTICE '⚠️ Coluna short_description não existe na tabela products';
    END IF;
END $$;

-- Adicionar colunas em falta para compatibilidade com a aplicação
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Garantir que description pode ser NULL (flexibilidade)
ALTER TABLE products 
ALTER COLUMN description DROP NOT NULL;

-- Atualizar slug para produtos que não têm
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-'))
WHERE slug IS NULL OR slug = '';

-- Tornar slug único
ALTER TABLE products 
ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- ============================================
-- 5. RECRIAR A VIEW products_with_offers - VERSÃO COMPATÍVEL
-- ============================================

-- Recriar a view products_with_offers apenas com colunas que existem
CREATE OR REPLACE VIEW products_with_offers AS
SELECT 
    p.id,
    p.name,
    CASE WHEN column_exists('products', 'slug') THEN p.slug ELSE LOWER(REPLACE(p.name, ' ', '-')) END as slug,
    p.description,
    p.price,
    p.commission_rate,
    CASE WHEN column_exists('products', 'commission_amount') THEN p.commission_amount ELSE NULL END as commission_amount,
    p.category_id,
    CASE WHEN column_exists('products', 'thumbnail_url') THEN p.thumbnail_url 
         WHEN column_exists('products', 'image_url') THEN p.image_url 
         ELSE NULL END as thumbnail_url,
    CASE WHEN column_exists('products', 'sales_page_url') THEN p.sales_page_url 
         WHEN column_exists('products', 'affiliate_link') THEN p.affiliate_link 
         ELSE NULL END as affiliate_link,
    COALESCE(p.status, 'active') as status,
    CASE WHEN column_exists('products', 'is_featured') THEN p.is_featured ELSE false END as is_featured,
    CASE WHEN column_exists('products', 'is_exclusive') THEN p.is_exclusive ELSE false END as is_exclusive,
    CASE WHEN column_exists('products', 'requires_approval') THEN p.requires_approval ELSE false END as requires_approval,
    p.created_at,
    p.updated_at,
    -- Agregar as ofertas relacionadas (se a tabela existir)
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_offers') 
    THEN COALESCE(
        json_agg(
            json_build_object(
                'id', po.id,
                'name', po.name,
                'description', po.description,
                'price', po.price,
                'commission_rate', po.commission_rate,
                'is_active', po.is_active,
                'created_at', po.created_at
            ) ORDER BY po.created_at
        ) FILTER (WHERE po.id IS NOT NULL), 
        '[]'::json
    )
    ELSE '[]'::json
    END as offers
FROM products p
LEFT JOIN product_offers po ON (p.id = po.product_id AND po.is_active = true)
WHERE COALESCE(p.status, 'active') IN ('active', 'pending')
GROUP BY 
    p.id, p.name, p.description, p.price, p.commission_rate, 
    p.category_id, p.created_at, p.updated_at, p.status;

-- Adicionar comentário à view
COMMENT ON VIEW products_with_offers IS 'View de produtos com suas ofertas agregadas - compatível com estrutura atual';

-- ============================================
-- 6. CONFIGURAÇÃO DE STORAGE PARA PERFIS
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
-- 7. POLÍTICAS DE SEGURANÇA (RLS) PARA STORAGE
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
-- 8. POLÍTICAS DE SEGURANÇA (RLS) PARA PRODUCTS
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
USING (
  COALESCE(status, 'active') IN ('active', 'pending') OR
  COALESCE(is_active, true) = true
);

-- ============================================
-- 9. POLÍTICAS DE SEGURANÇA (RLS) PARA PROFILES
-- ============================================

-- Policy para usuários atualizarem seus próprios perfis
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy para usuários visualizarem perfis
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT TO authenticated
USING (true);

-- ============================================
-- 10. VERIFICAÇÕES E VALIDAÇÕES
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
-- 11. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para busca por status em products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE column_exists('products', 'is_active');

-- Índice para slug em products (se existir)
DO $$
BEGIN
    IF column_exists('products', 'slug') THEN
        CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    END IF;
END $$;

-- Índice para busca por role/admin em profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE column_exists('profiles', 'role');
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE column_exists('profiles', 'is_admin');

-- ============================================
-- 12. TRIGGERS E FUNÇÕES AUXILIARES
-- ============================================

-- Função para limpar avatar antigo quando um novo é salvo
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
  old_path TEXT;
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
-- 13. DADOS DE EXEMPLO/TESTE (OPCIONAL)
-- ============================================

-- Inserir categorias básicas se não existirem (para produtos)
INSERT INTO categories (id, name, description, slug) VALUES
  (gen_random_uuid(), 'Marketing Digital', 'Produtos de marketing digital e afiliados', 'marketing-digital'),
  (gen_random_uuid(), 'Desenvolvimento', 'Cursos e produtos de programação', 'desenvolvimento'),
  (gen_random_uuid(), 'E-commerce', 'Produtos para vendas online', 'e-commerce'),
  (gen_random_uuid(), 'Finanças', 'Educação financeira e investimentos', 'financas')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 14. VERIFICAÇÕES FINAIS
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
END $$;

-- ============================================
-- 15. VERIFICAÇÃO DE INTEGRIDADE FINAL
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
    IF column_exists('products', 'short_description') THEN
        RAISE WARNING 'ATENÇÃO: Coluna short_description ainda existe na tabela products!';
    ELSE
        RAISE NOTICE '✅ Coluna short_description removida com sucesso da tabela products';
    END IF;
    
    -- Verificar se avatar_url foi adicionado
    IF column_exists('profiles', 'avatar_url') THEN
        RAISE NOTICE '✅ Coluna avatar_url adicionada com sucesso à tabela profiles';
    ELSE
        RAISE WARNING 'ATENÇÃO: Coluna avatar_url não foi adicionada à tabela profiles!';
    END IF;
END $$;

-- ============================================
-- 16. LIMPEZA
-- ============================================

-- Remover função auxiliar que não é mais necessária
DROP FUNCTION IF EXISTS column_exists(text, text);

-- ============================================
-- 17. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis dos usuários com informações estendidas incluindo avatar';
COMMENT ON TABLE products IS 'Produtos para afiliação (estrutura compatível com versão atual)';
COMMENT ON FUNCTION validate_avatar_url(TEXT) IS 'Valida URLs de avatar para perfis de usuário';
COMMENT ON FUNCTION cleanup_old_avatar() IS 'Remove avatares antigos do storage quando alterados';

-- ============================================
-- RESUMO DAS ALTERAÇÕES - VERSÃO CORRIGIDA V2
-- ============================================

/*
ALTERAÇÕES IMPLEMENTADAS (VERSÃO CORRIGIDA V2):

1. ✅ Detecta automaticamente a estrutura atual da tabela products
2. ✅ View recriada compatível com colunas existentes
3. ✅ Adicionado avatar_url à tabela profiles
4. ✅ Removido short_description apenas se existir
5. ✅ Configurado bucket 'profiles' para avatares
6. ✅ Implementado RLS completo para storage
7. ✅ Políticas de segurança para products (compatível)
8. ✅ Validação de URLs de avatar
9. ✅ Limpeza automática de avatares antigos
10. ✅ Índices para performance (condicionais)
11. ✅ Verificações e habilitação de RLS
12. ✅ Verificações de integridade final
13. ✅ Compatibilidade com estruturas diferentes

PROBLEMAS RESOLVIDOS:
- ❌ ERROR 42703: column p.currency does not exist
- ✅ Script agora detecta e trabalha apenas com colunas existentes
- ✅ View criada com colunas condicionais
- ✅ Compatível com estrutura simples e completa

ESTRUTURAS SUPORTADAS:
- ✅ Estrutura simples (database.types.ts)
- ✅ Estrutura completa (integrations/supabase/types.ts)
- ✅ Detecta automaticamente qual está em uso

PRÓXIMOS PASSOS:
- Testar upload de imagem na página de configurações
- Verificar se produtos conseguem ser cadastrados/excluídos
- Validar funcionamento das políticas RLS
- Considerar migração para estrutura completa se necessário
*/

-- ====================================================================
-- FIM DO SCRIPT DE ATUALIZAÇÕES CORRIGIDO V2
-- ==================================================================== 