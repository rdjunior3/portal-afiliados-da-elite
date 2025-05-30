-- ========================================
-- PORTAL AFILIADOS DA ELITE - FUNÇÕES OTIMIZADAS
-- Migração: 002_optimized_functions
-- ========================================

-- Função para obter estatísticas do afiliado
CREATE OR REPLACE FUNCTION get_affiliate_stats(affiliate_uuid UUID)
RETURNS TABLE (
    total_clicks BIGINT,
    total_conversions BIGINT,
    total_earnings DECIMAL(12,2),
    conversion_rate DECIMAL(5,2),
    active_links BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(analytics.clicks), 0) as total_clicks,
        COALESCE(SUM(commissions.conversions), 0) as total_conversions,
        COALESCE(SUM(commissions.earnings), 0.00) as total_earnings,
        CASE 
            WHEN COALESCE(SUM(analytics.clicks), 0) > 0 
            THEN ROUND((COALESCE(SUM(commissions.conversions), 0)::DECIMAL / SUM(analytics.clicks)) * 100, 2)
            ELSE 0.00
        END as conversion_rate,
        COALESCE(COUNT(DISTINCT al.id), 0) as active_links
    FROM affiliate_links al
    LEFT JOIN (
        SELECT 
            link_id,
            COUNT(*) as clicks
        FROM link_analytics
        GROUP BY link_id
    ) analytics ON al.id = analytics.link_id
    LEFT JOIN (
        SELECT 
            link_id,
            COUNT(*) as conversions,
            SUM(amount) as earnings
        FROM commissions
        WHERE status IN ('approved', 'paid')
        GROUP BY link_id
    ) commissions ON al.id = commissions.link_id
    WHERE al.affiliate_id = affiliate_uuid
    AND al.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Função para obter resumo de ganhos
CREATE OR REPLACE FUNCTION get_earnings_summary(affiliate_uuid UUID)
RETURNS TABLE (
    total_pending DECIMAL(12,2),
    total_approved DECIMAL(12,2),
    total_paid DECIMAL(12,2),
    this_month DECIMAL(12,2),
    last_month DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0.00) as total_pending,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0.00) as total_approved,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0.00) as total_paid,
        COALESCE(SUM(CASE 
            WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) 
            THEN amount ELSE 0 
        END), 0.00) as this_month,
        COALESCE(SUM(CASE 
            WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
            THEN amount ELSE 0 
        END), 0.00) as last_month
    FROM commissions
    WHERE affiliate_id = affiliate_uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para obter links com melhor performance
CREATE OR REPLACE FUNCTION get_top_performing_links(affiliate_uuid UUID, link_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    link_id UUID,
    short_code TEXT,
    product_name TEXT,
    clicks BIGINT,
    conversions BIGINT,
    earnings DECIMAL(12,2),
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id as link_id,
        al.short_code,
        p.name as product_name,
        COALESCE(analytics.clicks, 0) as clicks,
        COALESCE(commissions.conversions, 0) as conversions,
        COALESCE(commissions.earnings, 0.00) as earnings,
        CASE 
            WHEN COALESCE(analytics.clicks, 0) > 0 
            THEN ROUND((COALESCE(commissions.conversions, 0)::DECIMAL / analytics.clicks) * 100, 2)
            ELSE 0.00
        END as conversion_rate
    FROM affiliate_links al
    JOIN products p ON al.product_id = p.id
    LEFT JOIN (
        SELECT 
            link_id,
            COUNT(*) as clicks
        FROM link_analytics
        GROUP BY link_id
    ) analytics ON al.id = analytics.link_id
    LEFT JOIN (
        SELECT 
            link_id,
            COUNT(*) as conversions,
            SUM(amount) as earnings
        FROM commissions
        WHERE status IN ('approved', 'paid')
        GROUP BY link_id
    ) commissions ON al.id = commissions.link_id
    WHERE al.affiliate_id = affiliate_uuid
    AND al.is_active = true
    ORDER BY COALESCE(commissions.earnings, 0) DESC, COALESCE(analytics.clicks, 0) DESC
    LIMIT link_limit;
END;
$$ LANGUAGE plpgsql;

-- Função para obter analytics por período
CREATE OR REPLACE FUNCTION get_analytics_by_period(
    affiliate_uuid UUID,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    date DATE,
    clicks BIGINT,
    conversions BIGINT,
    earnings DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(la.clicked_at) as date,
        COUNT(la.id) as clicks,
        COALESCE(daily_conversions.conversions, 0) as conversions,
        COALESCE(daily_conversions.earnings, 0.00) as earnings
    FROM link_analytics la
    JOIN affiliate_links al ON la.link_id = al.id
    LEFT JOIN (
        SELECT 
            DATE(c.created_at) as date,
            COUNT(*) as conversions,
            SUM(c.amount) as earnings
        FROM commissions c
        JOIN affiliate_links al2 ON c.link_id = al2.id
        WHERE al2.affiliate_id = affiliate_uuid
        AND c.status IN ('approved', 'paid')
        AND DATE(c.created_at) BETWEEN start_date AND end_date
        GROUP BY DATE(c.created_at)
    ) daily_conversions ON DATE(la.clicked_at) = daily_conversions.date
    WHERE al.affiliate_id = affiliate_uuid
    AND DATE(la.clicked_at) BETWEEN start_date AND end_date
    GROUP BY DATE(la.clicked_at), daily_conversions.conversions, daily_conversions.earnings
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contadores de cliques
CREATE OR REPLACE FUNCTION update_click_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de cliques no perfil do afiliado
    UPDATE profiles 
    SET total_clicks = total_clicks + 1
    WHERE id = (
        SELECT affiliate_id 
        FROM affiliate_links 
        WHERE id = NEW.link_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contadores de conversões
CREATE OR REPLACE FUNCTION update_conversion_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contadores no perfil do afiliado
    UPDATE profiles 
    SET 
        total_conversions = total_conversions + 1,
        total_earnings = total_earnings + NEW.amount
    WHERE id = NEW.affiliate_id;
    
    -- Atualizar contador de vendas do produto
    UPDATE products 
    SET total_sales = total_sales + 1
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de contadores
DROP TRIGGER IF EXISTS update_click_counters_trigger ON link_analytics;
CREATE TRIGGER update_click_counters_trigger
    AFTER INSERT ON link_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_click_counters();

DROP TRIGGER IF EXISTS update_conversion_counters_trigger ON commissions;
CREATE TRIGGER update_conversion_counters_trigger
    AFTER INSERT ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_conversion_counters();

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_approvals ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para affiliate_links
CREATE POLICY "Affiliates can view own links" ON affiliate_links
    FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can create own links" ON affiliate_links
    FOR INSERT WITH CHECK (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can update own links" ON affiliate_links
    FOR UPDATE USING (auth.uid() = affiliate_id);

-- Políticas para commissions
CREATE POLICY "Affiliates can view own commissions" ON commissions
    FOR SELECT USING (auth.uid() = affiliate_id);

-- Políticas para payments
CREATE POLICY "Affiliates can view own payments" ON payments
    FOR SELECT USING (auth.uid() = affiliate_id);

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para product_approvals
CREATE POLICY "Affiliates can view own approvals" ON product_approvals
    FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can create own approvals" ON product_approvals
    FOR INSERT WITH CHECK (auth.uid() = affiliate_id); 