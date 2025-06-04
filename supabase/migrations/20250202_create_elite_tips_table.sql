-- ========================================
-- Tabela de Dicas Elite Editáveis
-- ========================================

-- Tabela para armazenar dicas editáveis pelos admins
CREATE TABLE IF NOT EXISTS elite_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    icon TEXT DEFAULT '💡',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Índices para performance (usar IF NOT EXISTS para evitar conflitos)
CREATE INDEX IF NOT EXISTS idx_elite_tips_active ON elite_tips(is_active);
CREATE INDEX IF NOT EXISTS idx_elite_tips_order ON elite_tips(order_index);

-- Trigger para atualizar updated_at (verificar se já existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_elite_tips_updated_at'
    ) THEN
        CREATE TRIGGER update_elite_tips_updated_at
            BEFORE UPDATE ON elite_tips
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- RLS Policies
ALTER TABLE elite_tips ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem ver dicas ativas" ON elite_tips;
DROP POLICY IF EXISTS "Admin tem acesso total a dicas" ON elite_tips;

-- Política para visualização (todos usuários autenticados podem ver dicas ativas)
CREATE POLICY "Usuários autenticados podem ver dicas ativas" ON elite_tips
    FOR SELECT
    USING (
        is_active = true AND
        auth.role() = 'authenticated'
    );

-- Política para admin (acesso total)
CREATE POLICY "Admin tem acesso total a dicas" ON elite_tips
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Inserir dicas padrão (apenas se a tabela estiver vazia)
INSERT INTO elite_tips (title, content, icon, order_index, is_active) 
SELECT 'Complete seu perfil', 'Complete seu perfil para desbloquear recursos premium exclusivos', '🏆', 1, true
WHERE NOT EXISTS (SELECT 1 FROM elite_tips WHERE title = 'Complete seu perfil');

INSERT INTO elite_tips (title, content, icon, order_index, is_active) 
SELECT 'Explore produtos premium', 'Explore nossos produtos com as maiores comissões do mercado', '💰', 2, true
WHERE NOT EXISTS (SELECT 1 FROM elite_tips WHERE title = 'Explore produtos premium');

INSERT INTO elite_tips (title, content, icon, order_index, is_active) 
SELECT 'Participe das capacitações', 'Participe das aulas de capacitação para aumentar suas vendas', '📚', 3, true
WHERE NOT EXISTS (SELECT 1 FROM elite_tips WHERE title = 'Participe das capacitações'); 