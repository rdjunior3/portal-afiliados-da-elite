-- ========================================
-- PORTAL AFILIADOS DA ELITE
-- Migrações Consolidadas para Aplicação Manual
-- Projeto: vhociemaoccrkpcylpit
-- ========================================

-- ========================================
-- 001: Setup Extensions
-- ========================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para timestamps automáticos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 002: Create Enums
-- ========================================

-- Enums do sistema
CREATE TYPE affiliate_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE event_type AS ENUM ('click', 'conversion', 'commission_earned', 'payment_sent');
CREATE TYPE payment_method AS ENUM ('pix', 'bank_transfer', 'paypal');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');

-- ========================================
-- 003: Update Profiles
-- ========================================

-- Expandir tabela profiles para afiliados
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_status affiliate_status DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_conversions INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Gerar affiliate_id automático
CREATE OR REPLACE FUNCTION generate_affiliate_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.affiliate_id IS NULL THEN
        NEW.affiliate_id := 'AFF' || UPPER(substring(gen_random_uuid()::text, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS generate_affiliate_id_trigger ON profiles;
CREATE TRIGGER generate_affiliate_id_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_affiliate_id();

-- ========================================
-- 004: Create Products Tables
-- ========================================

-- Categorias de produtos
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produtos para afiliação
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    sales_page_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aprovações de produtos por afiliado
CREATE TABLE IF NOT EXISTS product_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status affiliate_status DEFAULT 'pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, affiliate_id)
);

-- Triggers
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 005: Create Affiliate Links
-- ========================================

-- Links de afiliados
CREATE TABLE IF NOT EXISTS affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    short_code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    custom_params JSONB,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics de cliques
CREATE TABLE IF NOT EXISTS link_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comissões
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status commission_status DEFAULT 'pending',
    conversion_data JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para gerar short_code único
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.short_code IS NULL THEN
        NEW.short_code := LOWER(substring(gen_random_uuid()::text, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS generate_short_code_trigger ON affiliate_links;
CREATE TRIGGER generate_short_code_trigger
    BEFORE INSERT ON affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION generate_short_code();

DROP TRIGGER IF EXISTS update_affiliate_links_updated_at ON affiliate_links;
CREATE TRIGGER update_affiliate_links_updated_at
    BEFORE UPDATE ON affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commissions_updated_at ON commissions;
CREATE TRIGGER update_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 006: Create Creatives System
-- ========================================

-- Materiais criativos
CREATE TABLE IF NOT EXISTS creatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'banner', 'video', 'text', 'email'
    format TEXT, -- 'jpeg', 'png', 'gif', 'mp4', 'html'
    file_url TEXT,
    dimensions TEXT, -- '300x250', '728x90', etc.
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates de copy/swipe
CREATE TABLE IF NOT EXISTS copy_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- 'email', 'social_media', 'ad_copy', 'review'
    platform TEXT, -- 'facebook', 'instagram', 'twitter', 'email', etc.
    performance_rating DECIMAL(3,2) DEFAULT 0.00,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking de downloads de materiais
CREATE TABLE IF NOT EXISTS creative_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
    affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers
DROP TRIGGER IF EXISTS update_creatives_updated_at ON creatives;
CREATE TRIGGER update_creatives_updated_at
    BEFORE UPDATE ON creatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_copy_templates_updated_at ON copy_templates;
CREATE TRIGGER update_copy_templates_updated_at
    BEFORE UPDATE ON copy_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 007: Create Payments & Notifications
-- ========================================

-- Pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method payment_method NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    transaction_id TEXT,
    payment_data JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos do sistema para auditoria
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type event_type NOT NULL,
    entity_type TEXT, -- 'affiliate_link', 'commission', 'payment', etc.
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 008: Setup RLS Policies
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies para produtos e categorias (leitura pública)
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Policies para aprovações de produtos
DROP POLICY IF EXISTS "Affiliates can view own approvals" ON product_approvals;
CREATE POLICY "Affiliates can view own approvals" ON product_approvals
    FOR SELECT USING (affiliate_id = auth.uid());

-- Policies para links de afiliados
DROP POLICY IF EXISTS "Affiliates can manage own links" ON affiliate_links;
CREATE POLICY "Affiliates can manage own links" ON affiliate_links
    FOR ALL USING (affiliate_id = auth.uid());

-- Policies para analytics (só inserção para cliques)
DROP POLICY IF EXISTS "Anyone can insert link analytics" ON link_analytics;
CREATE POLICY "Anyone can insert link analytics" ON link_analytics
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Affiliates can view own link analytics" ON link_analytics;
CREATE POLICY "Affiliates can view own link analytics" ON link_analytics
    FOR SELECT USING (
        link_id IN (
            SELECT id FROM affiliate_links WHERE affiliate_id = auth.uid()
        )
    );

-- Policies para comissões
DROP POLICY IF EXISTS "Affiliates can view own commissions" ON commissions;
CREATE POLICY "Affiliates can view own commissions" ON commissions
    FOR SELECT USING (affiliate_id = auth.uid());

-- Policies para materiais criativos (leitura pública para ativos)
DROP POLICY IF EXISTS "Anyone can view active creatives" ON creatives;
CREATE POLICY "Anyone can view active creatives" ON creatives
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view copy templates" ON copy_templates;
CREATE POLICY "Anyone can view copy templates" ON copy_templates
    FOR SELECT USING (true);

-- Policies para downloads de materiais
DROP POLICY IF EXISTS "Affiliates can track own downloads" ON creative_downloads;
CREATE POLICY "Affiliates can track own downloads" ON creative_downloads
    FOR ALL USING (affiliate_id = auth.uid());

-- Policies para pagamentos
DROP POLICY IF EXISTS "Affiliates can view own payments" ON payments;
CREATE POLICY "Affiliates can view own payments" ON payments
    FOR SELECT USING (affiliate_id = auth.uid());

-- Policies para notificações
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Policies para eventos do sistema
DROP POLICY IF EXISTS "Users can view own events" ON system_events;
CREATE POLICY "Users can view own events" ON system_events
    FOR SELECT USING (user_id = auth.uid());

-- ========================================
-- 009: Create Analytics Functions
-- ========================================

-- Função para atualizar contadores de cliques
CREATE OR REPLACE FUNCTION update_click_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador no link
    UPDATE affiliate_links 
    SET updated_at = NOW()
    WHERE id = NEW.link_id;
    
    -- Atualizar contador no perfil do afiliado
    UPDATE profiles 
    SET total_clicks = total_clicks + 1,
        updated_at = NOW()
    WHERE id = (
        SELECT affiliate_id 
        FROM affiliate_links 
        WHERE id = NEW.link_id
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para atualizar contadores de conversões
CREATE OR REPLACE FUNCTION update_conversion_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador no perfil do afiliado
    UPDATE profiles 
    SET total_conversions = total_conversions + 1,
        total_earnings = total_earnings + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.affiliate_id;
    
    -- Atualizar contador de vendas no produto
    UPDATE products 
    SET total_sales = total_sales + 1,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para atualizar contador de downloads
CREATE OR REPLACE FUNCTION update_download_counter()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE creatives 
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = NEW.creative_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para atualizar contador de uso de templates
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE copy_templates 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.template_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para analytics automáticos
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

DROP TRIGGER IF EXISTS update_download_counter_trigger ON creative_downloads;
CREATE TRIGGER update_download_counter_trigger
    AFTER INSERT ON creative_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_download_counter();

-- Função para estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_affiliate_stats(affiliate_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_clicks', COALESCE(p.total_clicks, 0),
        'total_conversions', COALESCE(p.total_conversions, 0),
        'total_earnings', COALESCE(p.total_earnings, 0),
        'active_links', (
            SELECT COUNT(*) 
            FROM affiliate_links 
            WHERE affiliate_id = affiliate_uuid AND is_active = true
        ),
        'clicks_today', (
            SELECT COUNT(*) 
            FROM link_analytics la
            JOIN affiliate_links al ON la.link_id = al.id
            WHERE al.affiliate_id = affiliate_uuid 
            AND la.clicked_at >= CURRENT_DATE
        ),
        'commissions_pending', (
            SELECT COUNT(*) 
            FROM commissions 
            WHERE affiliate_id = affiliate_uuid AND status = 'pending'
        )
    ) INTO stats
    FROM profiles p
    WHERE p.id = affiliate_uuid;
    
    RETURN stats;
END;
$$ language 'plpgsql';

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Categorias iniciais
INSERT INTO categories (name, description, slug) VALUES
('Cursos Online', 'Cursos e treinamentos digitais', 'cursos-online'),
('E-books', 'Livros digitais e materiais educativos', 'ebooks'),
('Software', 'Ferramentas e aplicativos', 'software'),
('Consultoria', 'Serviços de consultoria especializada', 'consultoria')
ON CONFLICT (slug) DO NOTHING;

-- Produtos de exemplo
INSERT INTO products (name, description, price, commission_rate, category_id, sales_page_url) 
SELECT 
    'Curso de Marketing Digital Avançado',
    'Aprenda as estratégias mais avançadas de marketing digital',
    497.00,
    30.00,
    c.id,
    'https://exemplo.com/curso-marketing'
FROM categories c WHERE c.slug = 'cursos-online'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, commission_rate, category_id, sales_page_url)
SELECT 
    'E-book: Estratégias de Vendas',
    'Guia completo para aumentar suas vendas',
    97.00,
    40.00,
    c.id,
    'https://exemplo.com/ebook-vendas'
FROM categories c WHERE c.slug = 'ebooks'
ON CONFLICT DO NOTHING;

-- ========================================
-- FIM DAS MIGRAÇÕES
-- ========================================

-- Verificar se tudo foi criado corretamente
SELECT 'Migrações aplicadas com sucesso!' as status; 