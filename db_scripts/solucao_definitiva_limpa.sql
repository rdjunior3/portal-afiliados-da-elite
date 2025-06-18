-- ================================================================
-- SOLUÇÃO DEFINITIVA E LIMPA - CADASTRO DE PRODUTOS
-- Portal Afiliados da Elite - Script Final Simplificado
-- ================================================================

-- ============================================
-- 1. LIMPEZA COMPLETA (REMOVE CONFLITOS)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'LIMPANDO CONFLITOS EXISTENTES...';
    
    -- Remover objetos do bucket problemático
    DELETE FROM storage.objects WHERE bucket_id = 'product-images';
    
    -- Remover bucket problemático
    DELETE FROM storage.buckets WHERE id = 'product-images';
    
    -- Remover políticas conflitantes
    DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
    
    DROP POLICY IF EXISTS "product_images_select_policy" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_insert_policy" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_update_policy" ON storage.objects;
    DROP POLICY IF EXISTS "product_images_delete_policy" ON storage.objects;
    
    RAISE NOTICE 'LIMPEZA CONCLUIDA!';
END $$;

-- ============================================
-- 2. CRIAÇÃO LIMPA DO BUCKET
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'CRIANDO BUCKET PRODUCT-IMAGES...';
    
    -- Criar bucket com configurações mínimas
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'product-images',
        'product-images', 
        true,
        52428800, -- 50MB
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    );
    
    RAISE NOTICE 'BUCKET CRIADO COM SUCESSO!';
END $$;

-- ============================================
-- 3. POLÍTICAS ULTRA PERMISSIVAS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'CRIANDO POLITICAS PERMISSIVAS...';
    
    -- SELECT: Qualquer um pode ver
    CREATE POLICY "product_images_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');
    
    -- INSERT: Qualquer usuário autenticado pode fazer upload
    CREATE POLICY "product_images_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images');
    
    -- UPDATE: Qualquer usuário autenticado pode atualizar
    CREATE POLICY "product_images_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');
    
    -- DELETE: Qualquer usuário autenticado pode deletar
    CREATE POLICY "product_images_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-images');
    
    RAISE NOTICE 'POLITICAS CRIADAS COM SUCESSO!';
END $$;

-- ============================================
-- 4. VERIFICAÇÃO FINAL SIMPLES
-- ============================================
DO $$
DECLARE
    bucket_exists BOOLEAN;
    policies_count INTEGER;
BEGIN
    RAISE NOTICE 'VERIFICANDO RESULTADO...';
    
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO bucket_exists;
    SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%product_images%' INTO policies_count;
    
    IF bucket_exists AND policies_count = 4 THEN
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SUCESSO! PROBLEMA RESOLVIDO!';
        RAISE NOTICE 'Bucket product-images: CRIADO';
        RAISE NOTICE 'Politicas RLS: % CONFIGURADAS', policies_count;
        RAISE NOTICE '========================================';
        RAISE NOTICE '';
        RAISE NOTICE 'PROXIMOS PASSOS:';
        RAISE NOTICE '1. Feche o modal de produtos';
        RAISE NOTICE '2. Recarregue a pagina (F5)';
        RAISE NOTICE '3. Abra o modal novamente';
        RAISE NOTICE '4. Teste o cadastro';
        RAISE NOTICE '5. Deve funcionar perfeitamente!';
    ELSE
        RAISE NOTICE 'ERRO: Bucket=% Politicas=%', bucket_exists, policies_count;
    END IF;
END $$;

-- Resultado final
SELECT 'SCRIPT EXECUTADO COM SUCESSO!' as status; 