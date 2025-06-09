-- =====================================================
-- SIMPLIFICAÇÃO DO SISTEMA DE PERFIL
-- Data: 2025-01-30
-- Objetivo: Remover processo obrigatório de completar perfil
-- =====================================================

-- 1. TORNAR onboarding_completed_at OPCIONAL
-- Remover qualquer constraint que force esse campo
ALTER TABLE profiles 
ALTER COLUMN onboarding_completed_at DROP NOT NULL;

-- 2. ATUALIZAR PERFIS EXISTENTES SEM ONBOARDING_COMPLETED_AT
-- Marcar como completos todos os usuários que já têm nome
UPDATE profiles 
SET onboarding_completed_at = COALESCE(onboarding_completed_at, created_at)
WHERE first_name IS NOT NULL 
AND onboarding_completed_at IS NULL;

-- 3. GARANTIR QUE TODOS OS USUÁRIOS TENHAM AFFILIATE_CODE
-- Gerar códigos para usuários que não têm
UPDATE profiles 
SET affiliate_code = LOWER(
    'usr' || 
    SUBSTRING(id::text, 1, 8) || 
    EXTRACT(EPOCH FROM created_at)::text
)
WHERE affiliate_code IS NULL OR affiliate_code = '';

-- 4. GARANTIR QUE TODOS OS USUÁRIOS TENHAM AFFILIATE_STATUS
-- Definir status padrão para usuários sem status
UPDATE profiles 
SET affiliate_status = 'approved'
WHERE affiliate_status IS NULL OR affiliate_status = 'pending';

-- 5. GARANTIR QUE TODOS OS USUÁRIOS TENHAM ROLE
-- Definir role padrão
UPDATE profiles 
SET role = 'affiliate'
WHERE role IS NULL;

-- 6. FUNÇÃO PARA GERAR DADOS BÁSICOS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION auto_setup_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Gerar affiliate_code se não existe
    IF NEW.affiliate_code IS NULL OR NEW.affiliate_code = '' THEN
        NEW.affiliate_code := LOWER(
            'usr' || 
            SUBSTRING(NEW.id::text, 1, 8) || 
            EXTRACT(EPOCH FROM NOW())::text
        );
    END IF;
    
    -- Definir affiliate_status padrão
    IF NEW.affiliate_status IS NULL THEN
        NEW.affiliate_status := 'approved';
    END IF;
    
    -- Definir role padrão
    IF NEW.role IS NULL THEN
        NEW.role := 'affiliate';
    END IF;
    
    -- Definir onboarding como completo se tem informações básicas
    IF NEW.onboarding_completed_at IS NULL AND NEW.first_name IS NOT NULL THEN
        NEW.onboarding_completed_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER PARA NOVOS USUÁRIOS
DROP TRIGGER IF EXISTS auto_setup_new_user_trigger ON profiles;
CREATE TRIGGER auto_setup_new_user_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_setup_new_user();

-- 8. VERIFICAÇÃO: Mostrar status dos perfis
SELECT 'VERIFICAÇÃO: Status dos perfis após simplificação' as info;

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(first_name) as usuarios_com_nome,
    COUNT(onboarding_completed_at) as usuarios_com_onboarding,
    COUNT(affiliate_code) as usuarios_com_codigo,
    COUNT(CASE WHEN affiliate_status = 'approved' THEN 1 END) as usuarios_aprovados
FROM profiles;

-- 9. COMENTÁRIOS EXPLICATIVOS
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Campo opcional - usuários podem acessar o sistema sem completar onboarding';
COMMENT ON COLUMN profiles.affiliate_code IS 'Código único do afiliado - gerado automaticamente se não fornecido';
COMMENT ON COLUMN profiles.affiliate_status IS 'Status do afiliado - padrão aprovado para permitir acesso imediato';

-- 10. LIMPEZA CONDICIONAL DE DADOS
-- Verificar se existe a coluna action_url antes de tentar atualizar
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' 
               AND column_name = 'action_url') THEN
        -- Atualizar referências a complete-profile se a coluna existir
        UPDATE notifications 
        SET action_url = '/dashboard/settings'
        WHERE action_url LIKE '%complete-profile%';
        
        RAISE NOTICE 'Atualizadas referências de complete-profile em notifications';
    ELSE
        RAISE NOTICE 'Coluna action_url não existe em notifications - pulando limpeza';
    END IF;
END $$;

-- =====================================================
-- MIGRAÇÃO CONCLUÍDA
-- Sistema agora permite acesso direto ao dashboard
-- Perfil pode ser completado via configurações
-- ===================================================== 