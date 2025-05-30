-- Função para atualizar estatísticas do profile automaticamente
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas no perfil do usuário
    UPDATE profiles SET
        total_commissions = COALESCE((
            SELECT SUM(commission_amount) 
            FROM commissions 
            WHERE user_id = NEW.user_id AND status = 'approved'
        ), 0),
        total_clicks = COALESCE((
            SELECT SUM(clicks_count) 
            FROM affiliate_links 
            WHERE user_id = NEW.user_id
        ), 0),
        total_conversions = COALESCE((
            SELECT SUM(conversions_count) 
            FROM affiliate_links 
            WHERE user_id = NEW.user_id
        ), 0),
        conversion_rate = CASE 
            WHEN COALESCE((SELECT SUM(clicks_count) FROM affiliate_links WHERE user_id = NEW.user_id), 0) > 0
            THEN ROUND(
                (COALESCE((SELECT SUM(conversions_count) FROM affiliate_links WHERE user_id = NEW.user_id), 0) * 100.0) / 
                COALESCE((SELECT SUM(clicks_count) FROM affiliate_links WHERE user_id = NEW.user_id), 1), 
                2
            )
            ELSE 0
        END,
        last_activity_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar estatísticas do link quando houver click
CREATE OR REPLACE FUNCTION update_link_stats_on_click()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de clicks no link
    UPDATE affiliate_links SET
        clicks_count = clicks_count + 1,
        last_clicked_at = NEW.created_at
    WHERE id = NEW.link_id;
    
    -- Atualizar unique clicks se for um IP diferente
    IF NOT EXISTS (
        SELECT 1 FROM link_analytics 
        WHERE link_id = NEW.link_id 
        AND ip_address = NEW.ip_address 
        AND event_type = 'click'
        AND created_at::date = NEW.created_at::date
    ) THEN
        UPDATE affiliate_links SET
            unique_clicks_count = unique_clicks_count + 1
        WHERE id = NEW.link_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar estatísticas do link quando houver conversão
CREATE OR REPLACE FUNCTION update_link_stats_on_conversion()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de conversões no link
    UPDATE affiliate_links SET
        conversions_count = conversions_count + 1,
        revenue_generated = revenue_generated + NEW.commission_amount
    WHERE id = NEW.link_id;
    
    -- Atualizar taxa de conversão do produto
    UPDATE products SET
        conversion_rate_avg = (
            SELECT ROUND(AVG(
                CASE 
                    WHEN al.clicks_count > 0 
                    THEN (al.conversions_count::float / al.clicks_count) * 100 
                    ELSE 0 
                END
            ), 2)
            FROM affiliate_links al
            WHERE al.product_id = NEW.product_id
        )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar analytics quando link é clicado
CREATE OR REPLACE FUNCTION log_link_click(
    p_link_id UUID,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referer_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_analytics_id UUID;
BEGIN
    -- Buscar o user_id do link
    SELECT user_id INTO v_user_id 
    FROM affiliate_links 
    WHERE id = p_link_id;
    
    -- Inserir registro de analytics
    INSERT INTO link_analytics (
        link_id,
        user_id,
        event_type,
        ip_address,
        user_agent,
        referer_url,
        metadata
    ) VALUES (
        p_link_id,
        v_user_id,
        'click',
        p_ip_address,
        p_user_agent,
        p_referer_url,
        p_metadata
    ) RETURNING id INTO v_analytics_id;
    
    RETURN v_analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar conversão
CREATE OR REPLACE FUNCTION log_conversion(
    p_link_id UUID,
    p_order_id TEXT,
    p_customer_email TEXT,
    p_gross_amount DECIMAL,
    p_commission_rate DECIMAL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_product_id UUID;
    v_commission_amount DECIMAL;
    v_commission_id UUID;
BEGIN
    -- Buscar dados do link
    SELECT user_id, product_id INTO v_user_id, v_product_id
    FROM affiliate_links 
    WHERE id = p_link_id;
    
    -- Calcular valor da comissão
    v_commission_amount := p_gross_amount * (p_commission_rate / 100);
    
    -- Inserir comissão
    INSERT INTO commissions (
        user_id,
        product_id,
        link_id,
        order_id,
        customer_email,
        gross_amount,
        commission_rate,
        commission_amount,
        net_amount
    ) VALUES (
        v_user_id,
        v_product_id,
        p_link_id,
        p_order_id,
        p_customer_email,
        p_gross_amount,
        p_commission_rate,
        v_commission_amount,
        v_commission_amount -- Por enquanto sem desconto de taxas
    ) RETURNING id INTO v_commission_id;
    
    -- Inserir analytics de conversão
    INSERT INTO link_analytics (
        link_id,
        user_id,
        event_type,
        conversion_value,
        commission_earned,
        metadata
    ) VALUES (
        p_link_id,
        v_user_id,
        'conversion',
        p_gross_amount,
        v_commission_amount,
        p_metadata
    );
    
    RETURN v_commission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar relatório de performance
CREATE OR REPLACE FUNCTION generate_performance_report(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
    total_clicks BIGINT,
    unique_clicks BIGINT,
    total_conversions BIGINT,
    total_commissions DECIMAL,
    conversion_rate DECIMAL,
    avg_commission_value DECIMAL,
    top_products JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            SUM(al.clicks_count) as clicks,
            SUM(al.unique_clicks_count) as unique_clicks,
            SUM(al.conversions_count) as conversions,
            COALESCE(SUM(c.commission_amount), 0) as commissions,
            COUNT(DISTINCT al.product_id) as products_count
        FROM affiliate_links al
        LEFT JOIN commissions c ON c.link_id = al.id 
            AND c.conversion_date BETWEEN p_start_date AND p_end_date
        WHERE al.user_id = p_user_id
            AND al.created_at <= p_end_date
    ),
    top_prods AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'product_id', p.id,
                'product_name', p.name,
                'clicks', al.clicks_count,
                'conversions', al.conversions_count,
                'revenue', al.revenue_generated
            ) ORDER BY al.revenue_generated DESC
        ) FILTER (WHERE al.revenue_generated > 0) as top_products_data
        FROM affiliate_links al
        JOIN products p ON p.id = al.product_id
        WHERE al.user_id = p_user_id
            AND al.created_at <= p_end_date
        LIMIT 5
    )
    SELECT 
        s.clicks,
        s.unique_clicks,
        s.conversions,
        s.commissions,
        CASE 
            WHEN s.clicks > 0 THEN ROUND((s.conversions::decimal / s.clicks) * 100, 2)
            ELSE 0 
        END,
        CASE 
            WHEN s.conversions > 0 THEN ROUND(s.commissions / s.conversions, 2)
            ELSE 0 
        END,
        COALESCE(tp.top_products_data, '[]'::jsonb)
    FROM stats s
    CROSS JOIN top_prods tp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para analytics automático
CREATE TRIGGER update_profile_stats_on_commission
    AFTER INSERT OR UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_stats();

CREATE TRIGGER update_link_stats_on_analytics_click
    AFTER INSERT ON link_analytics
    FOR EACH ROW
    WHEN (NEW.event_type = 'click')
    EXECUTE FUNCTION update_link_stats_on_click();

CREATE TRIGGER update_link_stats_on_commission_created
    AFTER INSERT ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_link_stats_on_conversion(); 