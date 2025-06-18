-- ================================================================
-- VERIFICAÇÃO BUCKET PRODUCT-IMAGES
-- Portal Afiliados da Elite - Script de Verificação
-- ================================================================

-- Verificar se o bucket existe
SELECT 
    'BUCKET STATUS' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') 
        THEN '✅ BUCKET EXISTE'
        ELSE '❌ BUCKET NÃO EXISTE'
    END as status;

-- Listar buckets existentes
SELECT 
    'BUCKETS DISPONÍVEIS' as tipo,
    STRING_AGG(id, ', ') as buckets
FROM storage.buckets;

-- Verificar políticas
SELECT 
    'POLÍTICAS RLS' as tipo,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%product_images%';

-- Teste de permissões (se bucket existir)
DO $$
DECLARE
    bucket_exists BOOLEAN;
    test_result TEXT;
BEGIN
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO bucket_exists;
    
    IF bucket_exists THEN
        -- Verificar se o bucket é público
        SELECT 
            CASE WHEN public THEN 'PÚBLICO' ELSE 'PRIVADO' END
        INTO test_result
        FROM storage.buckets 
        WHERE id = 'product-images';
        
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ BUCKET PRODUCT-IMAGES STATUS:';
        RAISE NOTICE 'Existe: %', bucket_exists;
        RAISE NOTICE 'Visibilidade: %', test_result;
        RAISE NOTICE '';
        RAISE NOTICE '🎯 PRONTO PARA USO!';
        RAISE NOTICE 'Agora você pode:';
        RAISE NOTICE '1. Recarregar a página (F5)';
        RAISE NOTICE '2. Tentar cadastrar um produto';
        RAISE NOTICE '3. Upload deve funcionar!';
        RAISE NOTICE '========================================';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '❌ BUCKET NÃO ENCONTRADO!';
        RAISE NOTICE 'Execute primeiro: db_scripts/correcao_bucket_urgente.sql';
        RAISE NOTICE '';
    END IF;
END $$; 