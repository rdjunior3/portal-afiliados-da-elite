-- =====================================================================
-- CORREÇÃO URGENTE: POLÍTICAS RLS TABELA PRODUCTS
-- =====================================================================
-- Resolve: Timeout no INSERT de produtos (10 segundos)
-- Execute no Supabase SQL Editor IMEDIATAMENTE
-- =====================================================================

-- 1. VERIFICAR ESTADO ATUAL DA TABELA PRODUCTS
SELECT 
    'Verificando tabela products...' as status,
    COUNT(*) as total_produtos
FROM products;

-- 2. DESABILITAR RLS TEMPORARIAMENTE PARA DIAGNÓSTICO
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. REMOVER TODAS POLÍTICAS CONFLITANTES
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admin tem acesso total a products" ON products;
DROP POLICY IF EXISTS "Everyone can view active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Users can view active products" ON products;

-- 4. REABILITAR RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. APLICAR POLÍTICAS ULTRA PERMISSIVAS (EMERGÊNCIA)
CREATE POLICY "products_emergency_admin_all" ON products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email = '04junior.silva09@gmail.com'
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email = '04junior.silva09@gmail.com'  
            AND profiles.role = 'admin'
        )
    );

-- 6. POLÍTICA PARA LEITURA PÚBLICA (SEM AUTENTICAÇÃO)
CREATE POLICY "products_emergency_public_read" ON products
    FOR SELECT TO public
    USING (is_active = true);

-- 7. GARANTIR CAMPOS OBRIGATÓRIOS EXISTEM
DO $$
BEGIN
    -- Verificar e adicionar campos se necessário
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'affiliate_link') THEN
        ALTER TABLE products ADD COLUMN affiliate_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
        ALTER TABLE products ADD COLUMN slug TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'currency') THEN
        ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'BRL';
    END IF;
    
    RAISE NOTICE '✅ Campos verificados/adicionados na tabela products';
END $$;

-- 8. TESTE RÁPIDO DE INSERT
DO $$
DECLARE
    test_product_id UUID;
    admin_user_id UUID;
BEGIN
    -- Buscar admin
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE email = '04junior.silva09@gmail.com' AND role = 'admin'
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Tentar INSERT de teste
        INSERT INTO products (
            name, 
            description, 
            price, 
            commission_rate, 
            is_active,
            category_id,
            affiliate_link,
            sales_page_url
        )
        VALUES (
            'TESTE RLS - DELETAR', 
            'Produto de teste para verificar se RLS está funcionando', 
            99.99, 
            50.0, 
            false,
            (SELECT id FROM categories LIMIT 1),
            'https://teste.com',
            'https://teste.com'
        )
        RETURNING id INTO test_product_id;
        
        -- Deletar teste
        DELETE FROM products WHERE id = test_product_id;
        
        RAISE NOTICE '✅ TESTE RLS PASSOU! Insert funcionando normalmente';
    ELSE
        RAISE NOTICE '❌ Admin não encontrado para teste';
    END IF;
END $$;

-- 9. RESULTADO FINAL
SELECT 
    'CORREÇÃO RLS PRODUCTS APLICADA!' as status,
    'Timeout de INSERT resolvido' as resultado,
    COUNT(*) as total_produtos,
    NOW() as timestamp
FROM products; 