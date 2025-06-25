-- CORREÇÃO DEFINITIVA: ESTRUTURA PARA CATÁLOGO EXTERNO
-- Baseado na análise MCP completa da estrutura atual
-- Execute no Supabase Dashboard → SQL Editor

-- =========================================
-- 1. VERIFICAÇÃO DA ESTRUTURA ATUAL
-- =========================================
SELECT 
    'VERIFICAÇÃO INICIAL' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('affiliate_link', 'sales_page_url', 'tags', 'is_active', 'slug')
ORDER BY column_name;

-- =========================================
-- 2. CORREÇÕES CRÍTICAS (PRIORIDADE ALTA)
-- =========================================

-- PROBLEMA 1: Campo affiliate_link ausente (código espera, banco não tem)
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_link TEXT;

-- PROBLEMA 2: Campo tags ausente (código tenta inserir array)
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- PROBLEMA 3: Garantir is_active existe com default correto
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =========================================
-- 3. MIGRAÇÃO DE DADOS EXISTENTES
-- =========================================

-- Se sales_page_url contém links de afiliação, migrar para affiliate_link
UPDATE products 
SET affiliate_link = COALESCE(affiliate_link, sales_page_url)
WHERE affiliate_link IS NULL AND sales_page_url IS NOT NULL;

-- Garantir que produtos existentes tenham is_active = true
UPDATE products 
SET is_active = COALESCE(is_active, true)
WHERE is_active IS NULL;

-- Gerar slug se não existir
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '--', '-'))
WHERE slug IS NULL AND name IS NOT NULL;

-- =========================================
-- 4. OTIMIZAÇÕES PARA MODELO EXTERNO
-- =========================================

-- Garantir defaults corretos para novos produtos
ALTER TABLE products ALTER COLUMN currency SET DEFAULT 'BRL';
ALTER TABLE products ALTER COLUMN commission_rate SET DEFAULT 10.0;
ALTER TABLE products ALTER COLUMN is_active SET DEFAULT true;

-- =========================================
-- 5. TESTE COMPLETO DA ESTRUTURA
-- =========================================
DO $$
DECLARE
    test_category_id UUID;
    test_product_id UUID;
BEGIN
    -- Buscar categoria para teste
    SELECT id INTO test_category_id FROM categories LIMIT 1;
    
    -- Se não tem categoria, criar uma
    IF test_category_id IS NULL THEN
        INSERT INTO categories (name, slug, description) 
        VALUES ('Teste', 'teste', 'Categoria de teste')
        RETURNING id INTO test_category_id;
    END IF;
    
    -- Inserir produto com TODOS os campos que o código espera
    INSERT INTO products (
        name, 
        description, 
        category_id, 
        image_url, 
        affiliate_link,        -- CAMPO PRINCIPAL CORRIGIDO
        sales_page_url,        -- MANTER COMPATIBILIDADE
        price, 
        commission_rate, 
        commission_amount, 
        tags,                  -- CAMPO ADICIONADO
        is_active,             -- CAMPO GARANTIDO
        slug
    ) VALUES (
        'Produto Teste Estrutura Definitiva',
        'Teste completo da estrutura corrigida para catálogo externo',
        test_category_id,
        'https://exemplo.com/imagem-teste.jpg',
        'https://exemplo.com/affiliate-link-principal',  -- affiliate_link
        'https://exemplo.com/sales-page-compat',         -- sales_page_url
        149.90,
        20.0,
        29.98,
        ARRAY['teste', 'estrutura', 'definitivo'],       -- tags
        true,                                            -- is_active
        'produto-teste-estrutura-definitiva'             -- slug
    ) RETURNING id INTO test_product_id;
    
    -- Verificar se inserção foi bem-sucedida
    IF test_product_id IS NOT NULL THEN
        RAISE NOTICE 'SUCCESS: Produto teste criado com ID %', test_product_id;
        RAISE NOTICE 'SUCCESS: Todos os campos necessários existem e funcionam';
        
        -- Remover produto de teste
        DELETE FROM products WHERE id = test_product_id;
        RAISE NOTICE 'SUCCESS: Produto teste removido - estrutura está correta!';
    ELSE
        RAISE EXCEPTION 'ERRO: Produto teste não foi criado';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO no teste: %', SQLERRM;
        RAISE NOTICE 'Verifique se todos os campos foram criados corretamente';
END $$;

-- =========================================
-- 6. VERIFICAÇÃO FINAL
-- =========================================
SELECT 
    'ESTRUTURA FINAL VERIFICADA' as status,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN affiliate_link IS NOT NULL THEN 1 END) as produtos_com_affiliate_link,
    COUNT(CASE WHEN tags IS NOT NULL THEN 1 END) as produtos_com_tags,
    COUNT(CASE WHEN is_active = true THEN 1 END) as produtos_ativos
FROM products;

-- Mostrar estrutura final dos campos críticos
SELECT 
    'CAMPOS CRÍTICOS VERIFICADOS' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('affiliate_link', 'sales_page_url', 'tags', 'is_active')
ORDER BY column_name;

-- =========================================
-- RESULTADO ESPERADO
-- =========================================
-- ✅ Campo affiliate_link criado e funcional
-- ✅ Campo tags criado como TEXT[] com default vazio
-- ✅ Campo is_active garantido com default true
-- ✅ Dados existentes migrados corretamente
-- ✅ Teste de inserção completo bem-sucedido
-- ✅ Estrutura alinhada para modelo de catálogo externo
-- ✅ CreateProductModal deve funcionar sem erros 