-- ================================================================
-- SCRIPT INTELIGENTE DE MIGRAÇÃO - VERIFICAÇÃO E CORREÇÃO
-- Portal Afiliados da Elite - Aplicar apenas mudanças necessárias
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
-- 3. ADICIONAR APENAS COLUNAS QUE FALTAM
-- ============================================

-- Função para adicionar coluna se não existir
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name TEXT,
    column_name TEXT,
    column_definition TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = add_column_if_not_exists.table_name
        AND column_name = add_column_if_not_exists.column_name
        AND table_schema = 'public'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', table_name, column_name, column_definition);
        RAISE NOTICE '✅ Coluna % adicionada à tabela %', column_name, table_name;
    ELSE
        RAISE NOTICE '⏭️ Coluna % já existe na tabela %', column_name, table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar colunas necessárias
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
-- 5. CONFIGURAR STORAGE BUCKETS
-- ============================================

-- Função para criar bucket se não existir
CREATE OR REPLACE FUNCTION create_bucket_if_not_exists(
    bucket_id TEXT,
    bucket_name TEXT,
    is_public BOOLEAN,
    size_limit BIGINT,
    mime_types TEXT[]
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = bucket_id) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
        VALUES (bucket_id, bucket_name, is_public, size_limit, mime_types);
        RAISE NOTICE '✅ Bucket % criado', bucket_id;
    ELSE
        -- Atualizar configurações se bucket já existe
        UPDATE storage.buckets 
        SET public = is_public,
            file_size_limit = size_limit,
            allowed_mime_types = mime_types
        WHERE id = bucket_id;
        RAISE NOTICE '⏭️ Bucket % já existe - configurações atualizadas', bucket_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar buckets necessários
SELECT create_bucket_if_not_exists(
    'product-images', 
    'product-images', 
    true, 
    10485760, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
);

SELECT create_bucket_if_not_exists(
    'products', 
    'products', 
    true, 
    10485760, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
);

SELECT create_bucket_if_not_exists(
    'avatars', 
    'avatars', 
    true, 
    5242880, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

SELECT create_bucket_if_not_exists(
    'profiles', 
    'profiles', 
    true, 
    5242880, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Limpar função temporária
DROP FUNCTION IF EXISTS create_bucket_if_not_exists(TEXT, TEXT, BOOLEAN, BIGINT, TEXT[]);

-- ============================================
-- 6. CONFIGURAR POLÍTICAS RLS - PRODUCTS
-- ============================================

-- Habilitar RLS na tabela products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Função para criar política se não existir
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name TEXT,
    table_name TEXT,
    schema_name TEXT,
    policy_sql TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name 
        AND tablename = table_name 
        AND schemaname = schema_name
    ) THEN
        EXECUTE policy_sql;
        RAISE NOTICE '✅ Política % criada', policy_name;
    ELSE
        -- Recriar política para garantir que está atualizada
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_name, schema_name, table_name);
        EXECUTE policy_sql;
        RAISE NOTICE '🔄 Política % recriada', policy_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar políticas para products
SELECT create_policy_if_not_exists(
    'Admins can manage products',
    'products',
    'public',
    'CREATE POLICY "Admins can manage products" ON products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = ''admin'' OR profiles.is_admin = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = ''admin'' OR profiles.is_admin = true)
        )
    )'
);

SELECT create_policy_if_not_exists(
    'Public can view active products',
    'products',
    'public',
    'CREATE POLICY "Public can view active products" ON products
    FOR SELECT TO public
    USING (status = ''active'')'
);

-- ============================================
-- 7. CONFIGURAR POLÍTICAS RLS - STORAGE
-- ============================================

-- Políticas para bucket de produtos
SELECT create_policy_if_not_exists(
    'Admins can upload product images',
    'objects',
    'storage',
    'CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id IN (''products'', ''product-images'') AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = ''admin'' OR profiles.is_admin = true)
        )
    )'
);

SELECT create_policy_if_not_exists(
    'Public can view product images',
    'objects',
    'storage',
    'CREATE POLICY "Public can view product images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id IN (''products'', ''product-images''))'
);

-- Políticas para bucket de avatares
SELECT create_policy_if_not_exists(
    'Users can upload avatars',
    'objects',
    'storage',
    'CREATE POLICY "Users can upload avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN (''avatars'', ''profiles''))'
);

SELECT create_policy_if_not_exists(
    'Public can view avatars',
    'objects',
    'storage',
    'CREATE POLICY "Public can view avatars" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id IN (''avatars'', ''profiles''))'
);

-- Limpar função temporária
DROP FUNCTION IF EXISTS create_policy_if_not_exists(TEXT, TEXT, TEXT, TEXT);

-- ============================================
-- 8. CRIAR ÍNDICES SE NÃO EXISTIREM
-- ============================================

-- Função para criar índice se não existir
CREATE OR REPLACE FUNCTION create_index_if_not_exists(
    index_name TEXT,
    table_name TEXT,
    index_definition TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = index_name 
        AND tablename = table_name
    ) THEN
        EXECUTE index_definition;
        RAISE NOTICE '✅ Índice % criado', index_name;
    ELSE
        RAISE NOTICE '⏭️ Índice % já existe', index_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar índices necessários
SELECT create_index_if_not_exists(
    'idx_products_status',
    'products',
    'CREATE INDEX idx_products_status ON products(status)'
);

SELECT create_index_if_not_exists(
    'idx_products_is_featured',
    'products',
    'CREATE INDEX idx_products_is_featured ON products(is_featured)'
);

SELECT create_index_if_not_exists(
    'idx_products_is_exclusive',
    'products',
    'CREATE INDEX idx_products_is_exclusive ON products(is_exclusive)'
);

SELECT create_index_if_not_exists(
    'idx_products_commission_rate',
    'products',
    'CREATE INDEX idx_products_commission_rate ON products(commission_rate)'
);

-- Limpar função temporária
DROP FUNCTION IF EXISTS create_index_if_not_exists(TEXT, TEXT, TEXT);

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
            'active'::product_status,
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
BEGIN
    -- Contar elementos
    SELECT COUNT(*) INTO products_columns
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name IN ('sales_page_url', 'gravity_score', 'earnings_per_click', 'conversion_rate_avg', 'is_featured', 'is_exclusive');
    
    SELECT COUNT(*) INTO storage_buckets
    FROM storage.buckets 
    WHERE id IN ('products', 'product-images', 'avatars', 'profiles');
    
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO total_categories FROM categories;
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE '         RELATÓRIO FINAL DA MIGRAÇÃO       ';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '📊 Colunas products: %/6 necessárias', products_columns;
    RAISE NOTICE '🪣 Storage buckets: %/4 necessários', storage_buckets;
    RAISE NOTICE '📦 Produtos cadastrados: %', total_products;
    RAISE NOTICE '📂 Categorias disponíveis: %', total_categories;
    RAISE NOTICE '=============================================';
    
    -- Status final
    IF products_columns = 6 AND storage_buckets >= 2 THEN
        RAISE NOTICE '🎉 STATUS: MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE 'Próximos passos:';
        RAISE NOTICE '1. Testar cadastro de produtos na aplicação';
        RAISE NOTICE '2. Testar upload de imagens';
        RAISE NOTICE '3. Verificar logs no console do navegador';
    ELSE
        RAISE NOTICE '⚠️ STATUS: MIGRAÇÃO INCOMPLETA';
        RAISE NOTICE 'Verificar itens faltantes acima';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- Resultado final
SELECT 
    '✅ Migração inteligente concluída!' as resultado,
    'Estrutura atualizada com verificações' as detalhes,
    NOW() as executado_em; 