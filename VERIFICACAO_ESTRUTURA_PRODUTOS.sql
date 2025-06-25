-- VERIFICAÇÃO E CORREÇÃO DA ESTRUTURA DA TABELA PRODUCTS
-- Execute no Supabase Dashboard → SQL Editor
-- MODELO: CATÁLOGO DE PRODUTOS DE AFILIAÇÃO EXTERNA

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    'VERIFICAÇÃO DA TABELA PRODUCTS' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. VERIFICAR SE CAMPOS NECESSÁRIOS EXISTEM (MODELO EXTERNO)
DO $$
DECLARE
    missing_fields TEXT := '';
BEGIN
    RAISE NOTICE 'Verificando campos para modelo de catálogo externo...';
    
    -- Campos essenciais para catálogo de afiliação externa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name') THEN
        missing_fields := missing_fields || 'name, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        missing_fields := missing_fields || 'description, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        missing_fields := missing_fields || 'category_id, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        missing_fields := missing_fields || 'image_url, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'affiliate_link') THEN
        missing_fields := missing_fields || 'affiliate_link, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
        missing_fields := missing_fields || 'price, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_rate') THEN
        missing_fields := missing_fields || 'commission_rate, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_amount') THEN
        missing_fields := missing_fields || 'commission_amount, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        missing_fields := missing_fields || 'tags, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        missing_fields := missing_fields || 'is_active, ';
    END IF;
    
    IF missing_fields != '' THEN
        RAISE NOTICE 'Campos ausentes: %', missing_fields;
    ELSE
        RAISE NOTICE 'Todos os campos obrigatórios estão presentes';
    END IF;
END $$;

-- 3. ADICIONAR CAMPOS AUSENTES PARA MODELO EXTERNO
DO $$
BEGIN
    RAISE NOTICE 'Configurando estrutura para catálogo de afiliação externa...';
    
    -- Campos essenciais
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Campo image_url adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'affiliate_link') THEN
        ALTER TABLE products ADD COLUMN affiliate_link TEXT;
        RAISE NOTICE 'Campo affiliate_link adicionado (PRINCIPAL)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
        ALTER TABLE products ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Campo price adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_rate') THEN
        ALTER TABLE products ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 10;
        RAISE NOTICE 'Campo commission_rate adicionado (padrão 10%)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Campo commission_amount adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Campo tags adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Campo is_active adicionado';
    END IF;
    
    -- Campos opcionais para manter compatibilidade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE 'Campo sales_page_url adicionado (opcional)';
    END IF;
    
    RAISE NOTICE 'Estrutura configurada para modelo de catálogo externo!';
END $$;

-- 4. TESTE DE INSERÇÃO PARA MODELO EXTERNO
DO $$
DECLARE
    test_category_id UUID;
    test_product_id UUID;
BEGIN
    RAISE NOTICE 'Executando teste de inserção para modelo externo...';
    
    -- Buscar uma categoria para teste
    SELECT id INTO test_category_id FROM categories LIMIT 1;
    
    IF test_category_id IS NULL THEN
        RAISE NOTICE 'Nenhuma categoria encontrada, criando categoria de teste...';
        INSERT INTO categories (name, slug, description) 
        VALUES ('Teste', 'teste', 'Categoria de teste')
        RETURNING id INTO test_category_id;
    END IF;
    
    -- Tentar inserir produto de teste com modelo externo
    INSERT INTO products (
        name,
        description,
        category_id,
        image_url,
        affiliate_link,
        price,
        commission_rate,
        commission_amount,
        tags,
        is_active
    ) VALUES (
        'Produto de Afiliação Teste',
        'Descrição do produto de afiliação externa',
        test_category_id,
        'https://exemplo.com/imagem.jpg',
        'https://exemplo.com/affiliate-link',
        99.90,
        15.00,
        14.99,
        ARRAY['teste', 'afiliacao', 'externo'],
        true
    ) RETURNING id INTO test_product_id;
    
    RAISE NOTICE 'Teste de inserção bem-sucedido! ID: %', test_product_id;
    RAISE NOTICE 'Produto: R$ 99,90 | Comissão: 15%% (R$ 14,99)';
    
    -- Remover produto de teste
    DELETE FROM products WHERE id = test_product_id;
    RAISE NOTICE 'Produto de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no teste de inserção: %', SQLERRM;
END $$;

-- 5. RESULTADO FINAL
SELECT 
    'CONFIGURAÇÃO PARA CATÁLOGO EXTERNO CONCLUÍDA' as status,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN is_active = true THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN affiliate_link IS NOT NULL AND affiliate_link != '' THEN 1 END) as produtos_com_link
FROM products; 