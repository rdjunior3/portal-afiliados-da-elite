-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para CATEGORIES (público para leitura)
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

-- Políticas para PRODUCTS (público para leitura de ativos)
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (status = 'active');

-- Políticas para PRODUCT_APPROVALS
CREATE POLICY "Users can view own approvals" ON product_approvals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request approvals" ON product_approvals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para AFFILIATE_LINKS
CREATE POLICY "Users can view own links" ON affiliate_links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own links" ON affiliate_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON affiliate_links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON affiliate_links
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para LINK_ANALYTICS
CREATE POLICY "Users can view own analytics" ON link_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" ON link_analytics
    FOR INSERT WITH CHECK (true); -- Permite inserção por triggers/funções

-- Políticas para COMMISSIONS
CREATE POLICY "Users can view own commissions" ON commissions
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas para CREATIVES (público para leitura de ativos)
CREATE POLICY "Anyone can view active creatives" ON creatives
    FOR SELECT USING (is_active = true);

-- Políticas para CREATIVE_DOWNLOADS
CREATE POLICY "Users can view own downloads" ON creative_downloads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can download creatives" ON creative_downloads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para EMAIL_CAMPAIGNS (público para leitura de ativas)
CREATE POLICY "Anyone can view active email campaigns" ON email_campaigns
    FOR SELECT USING (is_active = true);

-- Políticas para LANDING_PAGE_TEMPLATES (público para leitura de ativas)
CREATE POLICY "Anyone can view active landing templates" ON landing_page_templates
    FOR SELECT USING (is_active = true);

-- Políticas para SWIPE_COPIES (público para leitura de ativas)
CREATE POLICY "Anyone can view active swipe copies" ON swipe_copies
    FOR SELECT USING (is_active = true);

-- Políticas para PAYMENT_METHODS_USER
CREATE POLICY "Users can view own payment methods" ON payment_methods_user
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment methods" ON payment_methods_user
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON payment_methods_user
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON payment_methods_user
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para PAYMENTS
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas para NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para NOTIFICATION_PREFERENCES
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para AUTOMATED_REPORTS
CREATE POLICY "Users can view own reports" ON automated_reports
    FOR SELECT USING (auth.uid() = user_id);

-- Criar função para automatically criar preferências de notificação
CREATE OR REPLACE FUNCTION create_notification_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar preferências automaticamente
CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_preferences_for_user(); 