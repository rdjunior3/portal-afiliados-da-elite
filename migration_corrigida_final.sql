-- ================================================================
-- SCRIPT CORRIGIDO - MIGRAÇÃO SEM AMBIGUIDADE
-- Portal Afiliados da Elite - Correção do erro de ambiguidade
-- Data: 06/01/2025
-- ================================================================

-- ============================================
-- 1. DIAGNÓSTICO COMPLETO DO ESTADO ATUAL
-- ============================================

DO $$
DECLARE
    rec RECORD;
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    existing_columns TEXT[] := ARRAY[]::TEXT[];
    required_columns TEXT[] := ARRAY['sales_page_url', 'gravity_score', 'earnings_per_click', 'conversion_rate_avg', 'refund_rate', 'is_featured', 'is_exclusive'];
    col TEXT;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '      DIAGNÓSTICO DO ESTADO ATUAL      ';
    RAISE NOTICE '==========================================';
    
    -- Verificar tabela products
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Tabela products existe';
        
        -- Verificar colunas necessárias
        FOREACH col IN ARRAY required_columns LOOP
            IF EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'products' 
                AND column_name = col
                AND table_schema = 'public'
            ) THEN
                existing_columns := array_append(existing_columns, col);
            ELSE
                missing_columns := array_append(missing_columns, col);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Colunas existentes: %', array_to_string(existing_columns, ', ');
        IF array_length(missing_columns, 1) > 0 THEN
            RAISE NOTICE 'Colunas faltando: %', array_to_string(missing_columns, ', ');
        ELSE
            RAISE NOTICE '✅ Todas as colunas necessárias já existem!';
        END IF;
    ELSE
        RAISE NOTICE '❌ Tabela products NÃO existe!';
    END IF;
    
    -- Verificar enum product_status
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        RAISE NOTICE '✅ Enum product_status existe';
    ELSE
        RAISE NOTICE '❌ Enum product_status NÃO existe';
    END IF;
    
    -- Verificar tabela profiles
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Coluna avatar_url existe no profiles';
    ELSE
        RAISE NOTICE '❌ Coluna avatar_url NÃO existe no profiles';
    END IF;
    
    RAISE NOTICE '==========================================';
END $$;

-- ============================================
-- 2. CRIAR ENUM SE NÃO EXISTIR
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');
        RAISE NOTICE '✅ Enum product_status criado';
    END IF;
END $$;

-- ============================================
-- 3. ADICIONAR APENAS COLUNAS QUE FALTAM (CORRIGIDO)
-- ============================================

-- Função corrigida para adicionar coluna se não existir
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    target_table TEXT,
    target_column TEXT,
    column_definition TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE information_schema.columns.table_name = target_table
        AND information_schema.columns.column_name = target_column
        AND information_schema.columns.table_schema = 'public'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', target_table, target_column, column_definition);
        RAISE NOTICE '✅ Coluna % adicionada à tabela %', target_column, target_table;
    ELSE
        RAISE NOTICE '⏭️ Coluna % já existe na tabela %', target_column, target_table;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar colunas necessárias com nomes únicos
SELECT add_column_if_not_exists('products', 'sales_page_url', 'TEXT');
SELECT add_column_if_not_exists('products', 'gravity_score', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('products', 'earnings_per_click', 'DECIMAL(10,4) DEFAULT 0');
SELECT add_column_if_not_exists('products', 'conversion_rate_avg', 'DECIMAL(5,2) DEFAULT 0');
SELECT add_column_if_not_exists('products', 'refund_rate', 'DECIMAL(5,2) DEFAULT 0');
SELECT add_column_if_not_exists('products', 'is_featured', 'BOOLEAN DEFAULT false');
SELECT add_column_if_not_exists('products', 'is_exclusive', 'BOOLEAN DEFAULT false');

-- Adicionar avatar_url ao profiles
SELECT add_column_if_not_exists('profiles', 'avatar_url', 'TEXT');

-- Limpar função temporária
DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT);

-- ============================================
-- 4. VERIFICAR E CORRIGIR TIPO DA COLUNA STATUS
-- ============================================

DO $$
BEGIN
    -- Verificar se a coluna status precisa ser convertida para enum
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'status'
        AND data_type != 'USER-DEFINED'
        AND table_schema = 'public'
    ) THEN
        BEGIN
            -- Tentar converter para enum
            ALTER TABLE products 
            ALTER COLUMN status TYPE product_status 
            USING CASE 
                WHEN status = 'active' THEN 'active'::product_status
                WHEN status = 'inactive' THEN 'inactive'::product_status
                WHEN status = 'pending' THEN 'pending'::product_status
                WHEN status = 'archived' THEN 'archived'::product_status
                ELSE 'active'::product_status
            END;
            RAISE NOTICE '✅ Coluna status convertida para enum';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Não foi possível converter status para enum: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '✅ Coluna status já usa enum ou não existe';
    END IF;
END $$;

-- ============================================
-- 5. CONFIGURAR STORAGE BUCKETS (MÉTODO DIRETO)
-- ============================================

-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'product-images', 
    'product-images', 
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket alternativo 'products'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'products', 
    'products', 
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'avatars', 
    'avatars', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket profiles para compatibilidade
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'profiles', 
    'profiles', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 6. CONFIGURAR POLÍTICAS RLS - PRODUCTS (MÉTODO DIRETO)
-- ============================================

-- Habilitar RLS na tabela products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem produtos
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

-- Política para leitura pública de produtos ativos
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
FOR SELECT TO public
USING (status = 'active');

-- ============================================
-- 7. CONFIGURAR POLÍTICAS RLS - STORAGE (MÉTODO DIRETO)
-- ============================================

-- Políticas para bucket de produtos
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id IN ('products', 'product-images') AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id IN ('products', 'product-images') AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id IN ('products', 'product-images') AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
);

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('products', 'product-images'));

-- Políticas para bucket de avatares
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('avatars', 'profiles'));

DROP POLICY IF EXISTS "Users can update their avatars" ON storage.objects;
CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id IN ('avatars', 'profiles') AND
    (storage.foldername(name))[1] = 'profiles'
);

DROP POLICY IF EXISTS "Users can delete their avatars" ON storage.objects;
CREATE POLICY "Users can delete their avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id IN ('avatars', 'profiles') AND
    (storage.foldername(name))[1] = 'profiles'
);

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('avatars', 'profiles'));

-- ============================================
-- 8. CRIAR ÍNDICES SE NÃO EXISTIREM (MÉTODO DIRETO)
-- ============================================

-- Criar índices necessários
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_exclusive ON products(is_exclusive);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============================================
-- 9. TESTE FUNCIONAL SEGURO
-- ============================================

DO $$
DECLARE
    test_product_id UUID;
    success_count INTEGER := 0;
    error_msg TEXT;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '       TESTE DE FUNCIONALIDADES        ';
    RAISE NOTICE '==========================================';
    
    -- Teste 1: Inserir produto com nova estrutura
    BEGIN
        INSERT INTO products (
            name,
            slug,
            price,
            commission_rate,
            affiliate_link,
            sales_page_url,
            status,
            is_featured,
            is_exclusive,
            gravity_score,
            earnings_per_click,
            conversion_rate_avg,
            refund_rate
        ) VALUES (
            'Teste Estrutura Atualizada',
            'teste-estrutura-' || floor(random()*10000),
            99.90,
            15.00,
            'https://teste.com/afiliado',
            'https://teste.com/vendas',
            'active',
            true,
            false,
            75,
            1.50,
            6.5,
            3.0
        ) RETURNING id INTO test_product_id;
        
        success_count := success_count + 1;
        RAISE NOTICE '✅ Teste 1: Inserção com nova estrutura - SUCESSO';
        
        -- Teste 2: Atualizar campos específicos
        UPDATE products 
        SET sales_page_url = 'https://teste.com/nova-vendas',
            earnings_per_click = 2.00,
            is_featured = false
        WHERE id = test_product_id;
        
        success_count := success_count + 1;
        RAISE NOTICE '✅ Teste 2: Atualização de campos - SUCESSO';
        
        -- Limpar teste
        DELETE FROM products WHERE id = test_product_id;
        RAISE NOTICE '🧹 Produto de teste removido';
        
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_msg = MESSAGE_TEXT;
        RAISE NOTICE '❌ Erro nos testes: %', error_msg;
    END;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'TESTES CONCLUÍDOS: % de 2 passaram', success_count;
    
    IF success_count = 2 THEN
        RAISE NOTICE '🎉 TODOS OS TESTES PASSARAM!';
    ELSE
        RAISE NOTICE '⚠️ ALGUNS TESTES FALHARAM - VERIFICAR ESTRUTURA';
    END IF;
    
    RAISE NOTICE '==========================================';
END $$;

-- ============================================
-- 10. RELATÓRIO FINAL
-- ============================================

DO $$
DECLARE
    rec RECORD;
    products_columns INTEGER;
    storage_buckets INTEGER;
    total_products INTEGER;
    total_categories INTEGER;
    rls_policies INTEGER;
    product_indexes INTEGER;
BEGIN
    -- Contar elementos
    SELECT COUNT(*) INTO products_columns
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name IN ('sales_page_url', 'gravity_score', 'earnings_per_click', 'conversion_rate_avg', 'is_featured', 'is_exclusive');
    
    SELECT COUNT(*) INTO storage_buckets
    FROM storage.buckets 
    WHERE id IN ('products', 'product-images', 'avatars', 'profiles');
    
    SELECT COUNT(*) INTO rls_policies
    FROM pg_policies 
    WHERE tablename = 'products' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO product_indexes
    FROM pg_indexes 
    WHERE tablename = 'products' 
    AND indexname LIKE 'idx_products_%';
    
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO total_categories FROM categories;
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE '         RELATÓRIO FINAL DA MIGRAÇÃO       ';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '📊 Colunas products: %/6 necessárias', products_columns;
    RAISE NOTICE '🪣 Storage buckets: %/4 necessários', storage_buckets;
    RAISE NOTICE '🔒 Políticas RLS: %', rls_policies;
    RAISE NOTICE '📈 Índices: %', product_indexes;
    RAISE NOTICE '📦 Produtos cadastrados: %', total_products;
    RAISE NOTICE '📂 Categorias disponíveis: %', total_categories;
    RAISE NOTICE '=============================================';
    
    -- Status final
    IF products_columns = 6 AND storage_buckets >= 2 AND rls_policies >= 1 THEN
        RAISE NOTICE '🎉 STATUS: MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE '✅ PRÓXIMOS PASSOS:';
        RAISE NOTICE '1. Testar cadastro de produtos na aplicação';
        RAISE NOTICE '2. Testar upload de imagens de produtos';
        RAISE NOTICE '3. Testar upload de avatar nas configurações';
        RAISE NOTICE '4. Verificar logs no console do navegador (F12)';
        RAISE NOTICE '5. Se houver erro, copiar mensagens do console';
    ELSE
        RAISE NOTICE '⚠️ STATUS: MIGRAÇÃO INCOMPLETA';
        RAISE NOTICE 'Verificar itens faltantes nos números acima';
        
        IF products_columns < 6 THEN
            RAISE NOTICE '❌ Faltam % colunas na tabela products', (6 - products_columns);
        END IF;
        
        IF storage_buckets < 2 THEN
            RAISE NOTICE '❌ Faltam buckets de storage';
        END IF;
        
        IF rls_policies < 1 THEN
            RAISE NOTICE '❌ Faltam políticas RLS';
        END IF;
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- Resultado final
SELECT 
    '✅ Migração corrigida executada!' as resultado,
    'Problema de ambiguidade resolvido' as correcao,
    NOW() as executado_em; 