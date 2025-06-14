-- ============================================
-- TESTE ESPECÍFICO DA OPERAÇÃO QUE ESTÁ FALHANDO
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. VERIFICAR O PRODUTO ESPECÍFICO
SELECT 
    'TESTE: Verificando produto específico que está falhando' AS status;

SELECT 
    id,
    name,
    status,
    created_at,
    updated_at
FROM products 
WHERE id = 'a95b825f-08ac-4872-ac92-2b163a310ace';

-- 2. VERIFICAR USUÁRIO ATUAL (simular auth.uid())
SELECT 
    'TESTE: Verificando usuário que está fazendo a operação' AS status;

-- Esta query simula o que acontece internamente
SELECT 
    p.id,
    p.email,
    p.role,
    p.is_admin,
    'Este usuário deveria ter permissão para fazer UPDATE' AS observacao
FROM profiles p
WHERE p.email = '04junior.silva09@gmail.com';

-- 3. TESTE DE PERMISSÃO RLS (simulação)
SELECT 
    'TESTE: Simulando verificação de permissão RLS' AS status;

-- Simular a consulta que o RLS faz internamente
WITH current_user AS (
    SELECT id, role, is_admin
    FROM profiles 
    WHERE email = '04junior.silva09@gmail.com'
),
target_product AS (
    SELECT id, name, status
    FROM products 
    WHERE id = 'a95b825f-08ac-4872-ac92-2b163a310ace'
)
SELECT 
    tp.id as product_id,
    tp.name as product_name,
    tp.status as current_status,
    cu.role as user_role,
    cu.is_admin,
    CASE 
        WHEN cu.role IN ('admin', 'super_admin') THEN 'DEVE PERMITIR UPDATE'
        WHEN cu.is_admin = true THEN 'DEVE PERMITIR UPDATE (is_admin)'
        ELSE 'DEVE NEGAR UPDATE'
    END as expected_permission
FROM target_product tp
CROSS JOIN current_user cu;

-- 4. VERIFICAR SE O ENUM ACEITA 'archived'
SELECT 
    'TESTE: Verificando se enum aceita status archived' AS status;

SELECT 
    enumlabel,
    enumsortorder
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'product_status'
)
ORDER BY enumsortorder;

-- 5. TESTE REAL DE UPDATE (cuidado - isso altera dados!)
-- Descomente apenas se quiser fazer o teste real
/*
SELECT 'TESTE REAL: Tentando fazer o UPDATE que está falhando...' AS status;

UPDATE products 
SET 
    status = 'archived',
    updated_at = NOW()
WHERE id = 'a95b825f-08ac-4872-ac92-2b163a310ace';

SELECT 'UPDATE executado com sucesso!' AS status;
*/

-- 6. ALTERNATIVA: Teste sem alterar dados
SELECT 
    'TESTE SEGURO: Verificando se UPDATE seria possível' AS status;

SELECT 
    id,
    name,
    status,
    CASE 
        WHEN status = 'active' THEN 'Pode ser arquivado'
        WHEN status = 'archived' THEN 'Já está arquivado'
        ELSE 'Status: ' || status
    END as can_archive
FROM products 
WHERE id = 'a95b825f-08ac-4872-ac92-2b163a310ace';

-- 7. VERIFICAR LOGS DE AUDIT (se existir tabela de audit)
SELECT 
    'TESTE: Verificando se há logs de audit ou erros' AS status;

-- Esta consulta verifica se existe alguma tabela de logs
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name ILIKE '%log%' 
       OR table_name ILIKE '%audit%' 
       OR table_name ILIKE '%event%')
ORDER BY table_name;

SELECT 
    'TESTE CONCLUÍDO! Analise os resultados acima para identificar o problema.' AS status;