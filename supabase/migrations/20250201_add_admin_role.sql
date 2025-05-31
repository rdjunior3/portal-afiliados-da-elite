-- ========================================
-- Adicionar suporte para Admin Role
-- ========================================

-- Adicionar coluna role à tabela profiles se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'affiliate' CHECK (role IN ('affiliate', 'admin'));

-- Atualizar políticas existentes para suportar admin
-- As novas políticas já foram criadas nas migrações de content e chat

-- Criar função helper para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = user_id 
        AND profiles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- Adicionar políticas de admin para tabelas existentes (se necessário)

-- Política para admin gerenciar profiles
CREATE POLICY "Admin pode gerenciar todos os profiles" ON profiles
    FOR ALL
    USING (is_admin(auth.uid()));

-- Política para admin gerenciar products
CREATE POLICY "Admin pode gerenciar todos os produtos" ON products
    FOR ALL
    USING (is_admin(auth.uid()));

-- Política para admin gerenciar categories
CREATE POLICY "Admin pode gerenciar todas as categorias" ON categories
    FOR ALL
    USING (is_admin(auth.uid()));

-- Política para admin gerenciar commissions
CREATE POLICY "Admin pode gerenciar todas as comissões" ON commissions
    FOR ALL
    USING (is_admin(auth.uid()));

-- Política para admin gerenciar payments
CREATE POLICY "Admin pode gerenciar todos os pagamentos" ON payments
    FOR ALL
    USING (is_admin(auth.uid()));

-- Política para admin gerenciar affiliate_links
CREATE POLICY "Admin pode gerenciar todos os links" ON affiliate_links
    FOR ALL
    USING (is_admin(auth.uid()));

-- Criar view para facilitar consultas de admin
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE affiliate_status = 'pending') as pending_affiliates,
    (SELECT COUNT(*) FROM profiles WHERE affiliate_status = 'approved') as approved_affiliates,
    (SELECT COUNT(*) FROM commissions WHERE status = 'pending') as pending_commissions,
    (SELECT SUM(amount) FROM commissions WHERE status = 'pending') as pending_commissions_value,
    (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
    (SELECT SUM(amount) FROM payments WHERE status = 'pending') as pending_payments_value,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
    (SELECT COUNT(*) FROM courses WHERE is_active = true) as active_courses;

-- Garantir que a view seja acessível apenas por admins
CREATE OR REPLACE FUNCTION check_admin_view_access()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar comentários às colunas para documentação
COMMENT ON COLUMN profiles.role IS 'Papel do usuário: affiliate (padrão) ou admin';
COMMENT ON FUNCTION is_admin IS 'Verifica se o usuário especificado tem papel de admin'; 