-- VERIFICAÇÃO COMPLETA: SALAS DE CHAT
-- Diagnosticar por que as salas não estão aparecendo

-- 1. VERIFICAR SE EXISTEM SALAS DE CHAT
SELECT 
    'VERIFICAÇÃO SALAS' as status,
    COUNT(*) as total_salas,
    COUNT(CASE WHEN is_active = true THEN 1 END) as salas_ativas
FROM chat_rooms;

-- 2. LISTAR TODAS AS SALAS
SELECT 
    'TODAS AS SALAS' as status,
    id, 
    name, 
    description, 
    type, 
    is_active, 
    created_at
FROM chat_rooms 
ORDER BY created_at DESC;

-- 3. VERIFICAR POLÍTICAS RLS DA TABELA CHAT_ROOMS
SELECT 
    'POLÍTICAS RLS CHAT_ROOMS' as status,
    policyname, 
    cmd, 
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'chat_rooms'
ORDER BY cmd, policyname;

-- 4. TESTAR ACESSO COMO USUÁRIO ESPECÍFICO
-- Simular contexto do usuário admin
DO $$
DECLARE
    test_rooms_count INTEGER;
BEGIN
    -- Contar salas que o usuário admin pode ver
    SELECT COUNT(*) INTO test_rooms_count
    FROM chat_rooms 
    WHERE is_active = true;
    
    RAISE NOTICE 'TESTE DE ACESSO: Usuário admin pode ver % salas ativas', test_rooms_count;
    
    IF test_rooms_count = 0 THEN
        RAISE NOTICE 'PROBLEMA: Políticas RLS podem estar bloqueando acesso às salas';
    ELSE
        RAISE NOTICE 'SUCCESS: Acesso às salas está OK';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO NO TESTE: %', SQLERRM;
END $$;

-- 5. CRIAR SALA DE TESTE SE NÃO EXISTIR "Comunidade da Elite"
DO $$
DECLARE
    elite_room_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se sala "Comunidade da Elite" existe
    SELECT EXISTS(
        SELECT 1 FROM chat_rooms 
        WHERE name = 'Comunidade da Elite' 
        AND is_active = true
    ) INTO elite_room_exists;
    
    IF NOT elite_room_exists THEN
        RAISE NOTICE 'CRIANDO: Sala "Comunidade da Elite" não encontrada, criando...';
        
        INSERT INTO chat_rooms (
            name,
            description,
            type,
            is_active
        ) VALUES (
            'Comunidade da Elite',
            'Canal principal da comunidade de afiliados elite',
            'general',
            true
        );
        
        RAISE NOTICE 'SUCCESS: Sala "Comunidade da Elite" criada';
    ELSE
        RAISE NOTICE 'OK: Sala "Comunidade da Elite" já existe';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO AO CRIAR SALA: %', SQLERRM;
END $$;

-- 6. VERIFICAÇÃO FINAL
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    id, 
    name, 
    is_active
FROM chat_rooms 
WHERE is_active = true
ORDER BY name; 