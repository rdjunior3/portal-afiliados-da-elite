-- DIAGNÓSTICO RÁPIDO SUPABASE
-- Execute no SQL Editor: vhociemaoccrkpcylpit.supabase.co

-- 1. Verificar tabelas básicas
SELECT 'TABELAS EXISTENTES:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Verificar buckets storage  
SELECT 'BUCKETS STORAGE:' as info;
SELECT id, name, public FROM storage.buckets ORDER BY id;

-- 3. Verificar dados críticos
DO $$
BEGIN
    -- Verificar chat_rooms (resolve erro 406/403)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_rooms') THEN
        RAISE NOTICE '✅ Tabela chat_rooms existe';
        IF EXISTS (SELECT 1 FROM chat_rooms WHERE name = 'Comunidade da Elite') THEN
            RAISE NOTICE '✅ Sala "Comunidade da Elite" existe';
        ELSE
            RAISE NOTICE '❌ Sala "Comunidade da Elite" NÃO existe (causa loop infinito)';
        END IF;
    ELSE
        RAISE NOTICE '❌ Tabela chat_rooms NÃO existe (causa erro 406/403)';
    END IF;

    -- Verificar bucket product-images (resolve upload)
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        RAISE NOTICE '✅ Bucket product-images existe';
    ELSE
        RAISE NOTICE '❌ Bucket product-images NÃO existe (falha upload produtos)';
    END IF;

    -- Verificar profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✅ Tabela profiles existe';
    ELSE
        RAISE NOTICE '❌ Tabela profiles NÃO existe (projeto vazio)';
    END IF;
END $$; 