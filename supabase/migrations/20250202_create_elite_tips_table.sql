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

-- Índices para performance
CREATE INDEX idx_elite_tips_active ON elite_tips(is_active);
CREATE INDEX idx_elite_tips_order ON elite_tips(order_index);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_elite_tips_updated_at
    BEFORE UPDATE ON elite_tips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE elite_tips ENABLE ROW LEVEL SECURITY;

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

-- Inserir dicas padrão
INSERT INTO elite_tips (title, content, icon, order_index, is_active) VALUES
(
    'Complete seu perfil', 
    'Complete seu perfil para desbloquear recursos premium exclusivos', 
    '🏆', 
    1, 
    true
),
(
    'Explore produtos premium', 
    'Explore nossos produtos com as maiores comissões do mercado', 
    '💰', 
    2, 
    true
),
(
    'Participe das capacitações', 
    'Participe das aulas de capacitação para aumentar suas vendas', 
    '📚', 
    3, 
    true
)
ON CONFLICT DO NOTHING; 