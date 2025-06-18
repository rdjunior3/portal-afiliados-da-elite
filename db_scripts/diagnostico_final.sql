-- DIAGNÓSTICO FINAL - CADASTRO DE PRODUTOS
-- Execute para identificar exatamente onde está o problema

-- ============================================
-- 1. VERIFICAR BUCKETS STORAGE
-- ============================================
DO $$
DECLARE
    bucket_count INTEGER;
    product_images_exists BOOLEAN := false;
BEGIN
    RAISE NOTICE 'VERIFICANDO BUCKETS DE STORAGE';
    
    SELECT COUNT(*) INTO bucket_count FROM storage.buckets;
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO product_images_exists;
    
    RAISE NOTICE 'Total de buckets: %', bucket_count;
    RAISE NOTICE 'Bucket product-images: %', CASE WHEN product_images_exists THEN 'EXISTE' ELSE 'NAO EXISTE' END;
    
    IF NOT product_images_exists THEN
        RAISE NOTICE 'PROBLEMA CONFIRMADO: Bucket product-images ausente';
    END IF;
END $$;

-- ============================================
-- 2. VERIFICAR POLÍTICAS RLS
-- ============================================
DO $$
DECLARE
    policies_count INTEGER;
BEGIN
    RAISE NOTICE 'VERIFICANDO POLITICAS RLS';
    
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%product%';
    
    RAISE NOTICE 'Politicas product-images: %', policies_count;
    
    IF policies_count < 4 THEN
        RAISE NOTICE 'PROBLEMA: Politicas insuficientes (precisa 4)';
    END IF;
END $$;

-- ============================================
-- 3. VERIFICAR ESTRUTURA PRODUCTS
-- ============================================
DO $$
DECLARE
    image_url_exists BOOLEAN;
    sales_page_url_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'VERIFICANDO ESTRUTURA PRODUCTS';
    
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') INTO image_url_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') INTO sales_page_url_exists;
    
    RAISE NOTICE 'Campo image_url: %', CASE WHEN image_url_exists THEN 'EXISTE' ELSE 'FALTANDO' END;
    RAISE NOTICE 'Campo sales_page_url: %', CASE WHEN sales_page_url_exists THEN 'EXISTE' ELSE 'FALTANDO' END;
END $$;

-- ============================================
-- 4. VERIFICAR ADMIN
-- ============================================
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'VERIFICANDO USUARIO ADMIN';
    
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = '1f47a584-db88-4094-aa63-b2564b21dca4' AND role = 'admin') INTO admin_exists;
    
    RAISE NOTICE 'Admin 04junior: %', CASE WHEN admin_exists THEN 'CONFIGURADO' ELSE 'PROBLEMA' END;
END $$;

-- ============================================
-- 5. PLANO DE AÇÃO
-- ============================================
DO $$
DECLARE
    bucket_ok BOOLEAN;
    policies_ok BOOLEAN;
    structure_ok BOOLEAN;
    admin_ok BOOLEAN;
    score INTEGER := 0;
BEGIN
    RAISE NOTICE 'CALCULANDO PLANO DE ACAO';
    
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO bucket_ok;
    SELECT COUNT(*) >= 4 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%product%' INTO policies_ok;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') INTO structure_ok;
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = '1f47a584-db88-4094-aa63-b2564b21dca4' AND role = 'admin') INTO admin_ok;
    
    IF bucket_ok THEN score := score + 1; END IF;
    IF policies_ok THEN score := score + 1; END IF;
    IF structure_ok THEN score := score + 1; END IF;
    IF admin_ok THEN score := score + 1; END IF;
    
    RAISE NOTICE 'SCORE: %/4', score;
    
    IF score = 4 THEN
        RAISE NOTICE 'SISTEMA OK - APENAS RECARREGAR PAGINA';
    ELSIF score >= 2 THEN
        RAISE NOTICE 'EXECUTAR SCRIPT DE CORRECAO';
    ELSE
        RAISE NOTICE 'PROBLEMA CRITICO - RECRIAR ESTRUTURA';
    END IF;
END $$; 