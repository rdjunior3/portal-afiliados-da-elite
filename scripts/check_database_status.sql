-- =========================================
-- Script de Diagnóstico do Banco de Dados
-- =========================================

-- 1. Verificar se a tabela elite_tips existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'elite_tips') 
        THEN '✅ Tabela elite_tips existe'
        ELSE '❌ Tabela elite_tips NÃO existe'
    END as status_tabela;

-- 2. Verificar se os índices existem
SELECT 
    indexname as indice,
    CASE 
        WHEN indexname IS NOT NULL 
        THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM pg_indexes 
WHERE tablename = 'elite_tips' 
AND indexname IN ('idx_elite_tips_active', 'idx_elite_tips_order');

-- 3. Verificar políticas RLS
SELECT 
    policyname as politica,
    '✅ Configurada' as status
FROM pg_policies 
WHERE tablename = 'elite_tips';

-- 4. Verificar dados na tabela (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'elite_tips') THEN
        -- Mostrar contagem de registros
        PERFORM (
            SELECT CASE 
                WHEN COUNT(*) > 0 
                THEN '✅ Tabela tem ' || COUNT(*) || ' dicas'
                ELSE '⚠️ Tabela está vazia'
            END
            FROM elite_tips
        );
    END IF;
END $$;

-- 5. Verificar estrutura de cursos e aulas
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') 
        THEN '✅ Tabela courses existe'
        ELSE '❌ Tabela courses NÃO existe'
    END as status_courses;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') 
        THEN '✅ Tabela lessons existe'
        ELSE '❌ Tabela lessons NÃO existe'
    END as status_lessons;

-- 6. Verificar se há dados de teste
SELECT 
    'courses' as tabela,
    COUNT(*) as registros
FROM courses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses')
UNION ALL
SELECT 
    'lessons' as tabela,
    COUNT(*) as registros
FROM lessons
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons'); 