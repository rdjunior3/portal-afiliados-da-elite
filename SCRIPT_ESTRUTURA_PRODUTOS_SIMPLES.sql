-- SCRIPT SIMPLES: ESTRUTURA PARA CATÁLOGO DE AFILIAÇÃO EXTERNA
-- Execute no Supabase Dashboard → SQL Editor

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. ADICIONAR CAMPOS NECESSÁRIOS (SEM MENSAGENS)

-- Campo image_url
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Campo affiliate_link (PRINCIPAL)
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_link TEXT;

-- Campo price
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;

-- Campo commission_rate
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10;

-- Campo commission_amount
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2) DEFAULT 0;

-- Campo tags
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Campo is_active
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Campo sales_page_url (opcional)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_page_url TEXT;

-- 3. TESTE DE INSERÇÃO
DO $$
DECLARE
    test_category_id UUID;
    test_product_id UUID;
BEGIN
    -- Buscar categoria
    SELECT id INTO test_category_id FROM categories LIMIT 1;
    
    -- Se não tem categoria, criar uma
    IF test_category_id IS NULL THEN
        INSERT INTO categories (name, slug, description) 
        VALUES ('Teste', 'teste', 'Categoria de teste')
        RETURNING id INTO test_category_id;
    END IF;
    
    -- Inserir produto de teste
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
        'Produto Teste Afiliação',
        'Produto para testar estrutura',
        test_category_id,
        'https://exemplo.com/imagem.jpg',
        'https://exemplo.com/affiliate-link',
        99.90,
        15.00,
        14.99,
        ARRAY['teste', 'afiliacao'],
        true
    ) RETURNING id INTO test_product_id;
    
    -- Remover produto de teste imediatamente
    DELETE FROM products WHERE id = test_product_id;
    
END $$;

-- 4. VERIFICAR RESULTADO
SELECT 
    'ESTRUTURA CONFIGURADA' as status,
    COUNT(*) as total_produtos
FROM products; 