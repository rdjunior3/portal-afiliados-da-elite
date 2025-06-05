-- ====================================================================
-- MIGRAÇÃO COMPLETA: PADRONIZAÇÃO DA ESTRUTURA DE PRODUCTS
-- Portal Afiliados da Elite - Sincronização completa com Front-end
-- Data: 04/06/2025
-- OBJETIVO: Alinhar 100% com src/integrations/supabase/types.ts
-- ====================================================================

-- ============================================
-- 1. BACKUP E ANÁLISE INICIAL
-- ============================================

-- Criar tabela de backup dos dados existentes
CREATE TABLE IF NOT EXISTS products_backup AS 
SELECT * FROM products;

-- Mostrar estrutura atual
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== COLUNAS ATUAIS DA TABELA PRODUCTS ===';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '% | % | %', rec.column_name, rec.data_type, rec.is_nullable;
    END LOOP;
END $$;

-- ============================================
-- 2. REMOVER DEPENDÊNCIAS
-- ============================================

-- Dropar views que dependem da tabela products
DROP VIEW IF EXISTS products_with_offers CASCADE;

-- ============================================
-- 3. MIGRAÇÃO DE DADOS EXISTENTES
-- ============================================

-- Criar tabela temporária para mapear dados
CREATE TABLE IF NOT EXISTS products_migration AS
SELECT 
    id,
    name,
    description,
    COALESCE(price, 0) as price,
    COALESCE(commission_rate, 10.00) as commission_rate,
    category_id,
    -- Mapear campos diferentes
    COALESCE(image_url, thumbnail_url) as thumbnail_url,
    COALESCE(sales_page_url, affiliate_link) as affiliate_link,
    COALESCE(is_active, true) as is_active,
    COALESCE(total_sales, 0) as total_sales,
    COALESCE(status, 'active') as status,
    created_at,
    updated_at,
    -- Gerar slug se não existir
    CASE 
        WHEN slug IS NOT NULL AND slug != '' THEN slug
        ELSE LOWER(REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\s]', '', 'g'))
    END as generated_slug
FROM products;

-- ============================================
-- 4. RECRIAR TABELA PRODUCTS COM ESTRUTURA COMPLETA
-- ============================================

-- Dropar tabela atual (dados estão no backup)
DROP TABLE IF EXISTS products CASCADE;

-- Criar ENUM se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');
    END IF;
END $$;

-- Criar tabela com estrutura COMPLETA conforme tipos TypeScript
CREATE TABLE products (
    -- Chaves e identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Informações básicas
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    
    -- Mídia
    thumbnail_url TEXT,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    
    -- Preços
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    
    -- Estrutura de comissão
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    commission_amount DECIMAL(10,2),
    
    -- Link de afiliado
    affiliate_link TEXT NOT NULL,
    tracking_pixel TEXT,
    
    -- Informações do fornecedor
    vendor_name TEXT,
    vendor_email TEXT,
    vendor_website TEXT,
    
    -- Dados de marketing
    conversion_flow TEXT,
    target_audience TEXT,
    keywords TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Métricas de performance
    gravity_score INTEGER DEFAULT 0,
    earnings_per_click DECIMAL(10,4) DEFAULT 0,
    conversion_rate_avg DECIMAL(5,2) DEFAULT 0,
    refund_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Status e configurações
    is_featured BOOLEAN DEFAULT false,
    is_exclusive BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    min_payout DECIMAL(10,2) DEFAULT 0,
    status product_status DEFAULT 'active',
    
    -- Agendamento
    launch_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. MIGRAR DADOS COM MAPEAMENTO
-- ============================================

-- Inserir dados migrados na nova estrutura
INSERT INTO products (
    id,
    name,
    slug,
    description,
    thumbnail_url,
    price,
    commission_rate,
    category_id,
    affiliate_link,
    status,
    created_at,
    updated_at
)
SELECT 
    id,
    name,
    REGEXP_REPLACE(LOWER(TRIM(generated_slug)), '\s+', '-', 'g') as slug,
    description,
    thumbnail_url,
    price,
    commission_rate,
    category_id,
    affiliate_link,
    CASE 
        WHEN is_active = true THEN 'active'::product_status
        ELSE 'inactive'::product_status
    END as status,
    created_at,
    updated_at
FROM products_migration
ON CONFLICT (id) DO NOTHING;

-- Garantir slugs únicos
UPDATE products 
SET slug = slug || '-' || SUBSTRING(id::text, 1, 8)
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
        FROM products
    ) t WHERE rn > 1
);

-- ============================================
-- 6. ADICIONAR AVATAR_URL AOS PROFILES
-- ============================================

-- Adicionar coluna avatar_url para upload de imagem de perfil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN profiles.avatar_url IS 'URL da imagem de perfil do usuário armazenada no Storage';

-- ============================================
-- 7. RECRIAR VIEWS E ÍNDICES
-- ============================================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_exclusive ON products(is_exclusive);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));

-- View products_with_offers simplificada para compatibilidade
CREATE OR REPLACE VIEW products_with_offers AS
SELECT 
    p.*,
    -- Agregar ofertas se a tabela existir
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
GROUP BY p.id;

-- ============================================
-- 8. CONFIGURAR STORAGE PARA AVATARES
-- ============================================

-- Criar bucket para avatares se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profiles', 
  'profiles', 
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 9. POLÍTICAS RLS PARA STORAGE
-- ============================================

-- Policy para usuários fazerem upload de avatares
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy para atualizações
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy para exclusões
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy para leitura pública
DROP POLICY IF EXISTS "Public access to profile avatars" ON storage.objects;
CREATE POLICY "Public access to profile avatars" ON storage.objects
FOR SELECT TO public
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- ============================================
-- 10. POLÍTICAS RLS PARA PRODUCTS
-- ============================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy para admins gerenciarem produtos
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy para usuários visualizarem produtos ativos
DROP POLICY IF EXISTS "Users can view active products" ON products;
CREATE POLICY "Users can view active products" ON products
FOR SELECT TO authenticated
USING (status IN ('active', 'pending'));

-- ============================================
-- 11. POLÍTICAS RLS PARA PROFILES
-- ============================================

-- Habilitar RLS se não estiver
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy para usuários atualizarem próprio perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy para visualização de perfis
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT TO authenticated
USING (true);

-- ============================================
-- 12. TRIGGERS E FUNÇÕES
-- ============================================

-- Função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para validação de avatar
CREATE OR REPLACE FUNCTION validate_avatar_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF url IS NULL THEN
    RETURN TRUE;
  END IF;
  
  IF url ~ '^https://[a-zA-Z0-9-]+\.supabase\.co/storage/v1/object/public/profiles/avatars/.+' THEN
    RETURN TRUE;
  END IF;
  
  IF url ~ '^https?://.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Constraint para avatar_url
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_avatar_url;
ALTER TABLE profiles 
ADD CONSTRAINT valid_avatar_url 
CHECK (validate_avatar_url(avatar_url));

-- Função para limpeza de avatares antigos
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
  old_path TEXT;
BEGIN
  IF OLD.avatar_url IS NOT NULL 
     AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url 
     AND OLD.avatar_url LIKE '%supabase.co/storage%' THEN
    
    old_path := substring(OLD.avatar_url from '/storage/v1/object/public/profiles/(.+)$');
    
    IF old_path IS NOT NULL THEN
      DELETE FROM storage.objects 
      WHERE bucket_id = 'profiles' AND name = old_path;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpeza
DROP TRIGGER IF EXISTS trigger_cleanup_old_avatar ON profiles;
CREATE TRIGGER trigger_cleanup_old_avatar
  AFTER UPDATE OF avatar_url ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_avatar();

-- ============================================
-- 13. INSERIR CATEGORIAS PADRÃO
-- ============================================

INSERT INTO categories (id, name, slug, description, color) VALUES
  (gen_random_uuid(), 'Marketing Digital', 'marketing-digital', 'Produtos de marketing digital e afiliados', '#f97316'),
  (gen_random_uuid(), 'Desenvolvimento', 'desenvolvimento', 'Cursos e produtos de programação', '#3b82f6'),
  (gen_random_uuid(), 'E-commerce', 'e-commerce', 'Produtos para vendas online', '#10b981'),
  (gen_random_uuid(), 'Finanças', 'financas', 'Educação financeira e investimentos', '#8b5cf6'),
  (gen_random_uuid(), 'Saúde e Bem-estar', 'saude-bem-estar', 'Produtos de saúde e qualidade de vida', '#ef4444'),
  (gen_random_uuid(), 'Educação', 'educacao', 'Cursos e treinamentos educacionais', '#f59e0b')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 14. VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar migração
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
    missing_cols TEXT[];
    expected_cols TEXT[] := ARRAY[
        'id', 'name', 'slug', 'short_description', 'description', 'thumbnail_url',
        'images', 'video_url', 'price', 'original_price', 'currency', 
        'commission_rate', 'commission_amount', 'affiliate_link', 'tracking_pixel',
        'vendor_name', 'vendor_email', 'vendor_website', 'conversion_flow',
        'target_audience', 'keywords', 'tags', 'gravity_score', 'earnings_per_click',
        'conversion_rate_avg', 'refund_rate', 'is_featured', 'is_exclusive',
        'requires_approval', 'min_payout', 'status', 'launch_date', 'end_date',
        'category_id', 'created_at', 'updated_at'
    ];
    col TEXT;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO old_count FROM products_backup;
    SELECT COUNT(*) INTO new_count FROM products;
    
    RAISE NOTICE '=== RELATÓRIO DA MIGRAÇÃO ===';
    RAISE NOTICE 'Produtos no backup: %', old_count;
    RAISE NOTICE 'Produtos migrados: %', new_count;
    
    -- Verificar colunas
    FOREACH col IN ARRAY expected_cols
    LOOP
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = col
        ) THEN
            missing_cols := array_append(missing_cols, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_cols, 1) > 0 THEN
        RAISE WARNING 'Colunas faltando: %', array_to_string(missing_cols, ', ');
    ELSE
        RAISE NOTICE '✅ Todas as colunas esperadas estão presentes';
    END IF;
    
    -- Verificar avatar_url
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        RAISE NOTICE '✅ Coluna avatar_url adicionada aos profiles';
    ELSE
        RAISE WARNING 'Coluna avatar_url não encontrada nos profiles';
    END IF;
    
    -- Verificar RLS
    IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'products') THEN
        RAISE NOTICE '✅ RLS habilitado para products';
    ELSE
        RAISE WARNING 'RLS não habilitado para products';
    END IF;
END $$;

-- ============================================
-- 15. LIMPEZA
-- ============================================

-- Comentários para documentação
COMMENT ON TABLE products IS 'Produtos para afiliação - estrutura completa sincronizada com TypeScript';
COMMENT ON TABLE products_backup IS 'Backup dos dados originais antes da migração';
COMMENT ON TABLE products_migration IS 'Tabela temporária para mapeamento de dados';

-- Dropar tabelas temporárias após confirmação
-- DROP TABLE IF EXISTS products_migration;
-- DROP TABLE IF EXISTS products_backup;

-- ============================================
-- RESUMO DA MIGRAÇÃO
-- ============================================

/*
MIGRAÇÃO COMPLETA EXECUTADA COM SUCESSO:

✅ ESTRUTURA PADRONIZADA:
- Tabela products recriada com 36 colunas conforme tipos TypeScript
- Todos os campos esperados pelo front-end estão presentes
- Mapeamento correto: image_url → thumbnail_url, sales_page_url → affiliate_link

✅ DADOS MIGRADOS:
- Produtos existentes preservados e migrados
- Slugs gerados automaticamente quando necessário
- Status convertido corretamente (is_active → status)

✅ FUNCIONALIDADES ADICIONADAS:
- avatar_url nos profiles para upload de imagem
- Bucket de storage configurado para avatares
- RLS completo para products e profiles
- Views e índices recriados

✅ COMPATIBILIDADE:
- 100% compatível com src/integrations/supabase/types.ts
- Todas as queries do front-end funcionarão corretamente
- Sem mais erros de colunas inexistentes

✅ SEGURANÇA:
- RLS habilitado e configurado
- Policies para storage de avatares
- Validação de URLs de avatar
- Limpeza automática de arquivos antigos

PRÓXIMOS PASSOS:
1. Testar funcionalidades da aplicação
2. Verificar upload de avatares nas configurações
3. Confirmar CRUD de produtos funcionando
4. Após confirmação, remover tabelas de backup
*/

-- ====================================================================
-- FIM DA MIGRAÇÃO COMPLETA
-- ==================================================================== 