-- =====================================================
-- CORREÇÃO COMPLETA: Schema do Banco de Dados
-- Data: 2025-01-30
-- Problemas: Campos faltantes e inconsistências
-- =====================================================

-- 1. ADICIONAR CAMPO FALTANTE NA TABELA PROFILES
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;

-- 2. ADICIONAR CAMPO affiliate_code QUE O CÓDIGO ESPERA
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS affiliate_code text;

-- 3. CRIAR ÍNDICE ÚNICO PARA affiliate_code
CREATE UNIQUE INDEX IF NOT EXISTS profiles_affiliate_code_unique 
ON profiles (affiliate_code) 
WHERE affiliate_code IS NOT NULL;

-- 4. FUNÇÃO PARA GERAR AFFILIATE_CODE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Se affiliate_code está vazio, gerar um novo
    IF NEW.affiliate_code IS NULL OR NEW.affiliate_code = '' THEN
        NEW.affiliate_code := LOWER(
            COALESCE(NEW.first_name, '') || 
            COALESCE(NEW.last_name, '') || 
            EXTRACT(EPOCH FROM NOW())::text
        );
        -- Remove espaços e caracteres especiais
        NEW.affiliate_code := REGEXP_REPLACE(NEW.affiliate_code, '[^a-z0-9]', '', 'g');
        -- Garantir que tenha pelo menos 8 caracteres
        IF LENGTH(NEW.affiliate_code) < 8 THEN
            NEW.affiliate_code := NEW.affiliate_code || EXTRACT(EPOCH FROM NOW())::text;
        END IF;
        -- Truncar se muito longo
        NEW.affiliate_code := SUBSTRING(NEW.affiliate_code, 1, 20);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER PARA GERAR affiliate_code AUTOMATICAMENTE
DROP TRIGGER IF EXISTS generate_affiliate_code_trigger ON profiles;
CREATE TRIGGER generate_affiliate_code_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_affiliate_code();

-- 6. ATUALIZAR REGISTROS EXISTENTES QUE NÃO TÊM affiliate_code
UPDATE profiles 
SET affiliate_code = LOWER(
    COALESCE(first_name, '') || 
    COALESCE(last_name, '') || 
    EXTRACT(EPOCH FROM created_at)::text
)
WHERE affiliate_code IS NULL OR affiliate_code = '';

-- 7. GARANTIR QUE O USUÁRIO ATUAL SEJA ADMIN (para testes)
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE id = auth.uid()
AND role NOT IN ('admin', 'super_admin');

-- 8. VERIFICAÇÃO: Mostrar estrutura atualizada da tabela profiles
SELECT 'VERIFICAÇÃO: Campos da tabela profiles' as info;

SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as aceita_nulo,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN (
    'onboarding_completed_at', 
    'affiliate_code', 
    'affiliate_id',
    'first_name',
    'last_name',
    'phone',
    'role',
    'affiliate_status'
)
ORDER BY column_name;

-- 9. VERIFICAR SEU PERFIL ATUAL
SELECT 'SEU PERFIL ATUAL:' as info;
SELECT 
    id,
    email,
    role,
    affiliate_status,
    first_name,
    last_name,
    phone,
    affiliate_code,
    affiliate_id,
    onboarding_completed_at,
    created_at
FROM profiles 
WHERE id = auth.uid(); 