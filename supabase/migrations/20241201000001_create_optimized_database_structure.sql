-- Portal Afiliados da Elite - Estrutura Otimizada do Banco de Dados
-- Criado para máximo desempenho e escalabilidade

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABELA: profiles (Usuários/Afiliados)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
            THEN first_name || ' ' || last_name
            WHEN first_name IS NOT NULL 
            THEN first_name
            ELSE email
        END
    ) STORED,
    avatar_url TEXT,
    phone TEXT,
    document_number TEXT UNIQUE,
    birth_date DATE,
    bio TEXT,
    website_url TEXT,
    
    -- Social Media
    social_instagram TEXT,
    social_youtube TEXT,
    social_tiktok TEXT,
    social_linkedin TEXT,
    
    -- Affiliate Data
    role TEXT DEFAULT 'affiliate' CHECK (role IN ('affiliate', 'admin')),
    affiliate_status TEXT DEFAULT 'pending' CHECK (affiliate_status IN ('pending', 'approved', 'rejected', 'suspended')),
    affiliate_id TEXT UNIQUE,
    affiliate_code TEXT UNIQUE,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    
    -- Performance Metrics
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Activity Tracking
    last_activity_at TIMESTAMPTZ,
    onboarding_completed_at TIMESTAMPTZ,
    terms_accepted_at TIMESTAMPTZ,
    privacy_accepted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: categories (Categorias de Produtos)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    color TEXT DEFAULT '#6366f1',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: products (Produtos para Afiliação)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES categories(id),
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    
    -- Media
    thumbnail_url TEXT,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    
    -- Pricing
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    
    -- Commission Structure
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2),
    
    -- Affiliate Link
    affiliate_link TEXT NOT NULL,
    tracking_pixel TEXT,
    
    -- Vendor Info
    vendor_name TEXT,
    vendor_email TEXT,
    vendor_website TEXT,
    
    -- Marketing Data
    conversion_flow TEXT,
    target_audience TEXT,
    keywords TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Performance Metrics
    gravity_score DECIMAL(8,2) DEFAULT 0.00,
    earnings_per_click DECIMAL(8,2) DEFAULT 0.00,
    conversion_rate_avg DECIMAL(5,2) DEFAULT 0.00,
    refund_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status & Settings
    is_featured BOOLEAN DEFAULT FALSE,
    is_exclusive BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    min_payout DECIMAL(8,2) DEFAULT 50.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'archived')),
    
    -- Scheduling
    launch_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: courses (Cursos/Aulas)
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: lessons (Aulas dos Cursos)
-- =====================================================
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_seconds INTEGER,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: materials (Materiais de Apoio)
-- =====================================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: chat_rooms (Salas de Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: messages (Mensagens do Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: affiliate_links (Links de Afiliado)
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Link Configuration
    custom_slug TEXT NOT NULL UNIQUE,
    full_url TEXT NOT NULL,
    original_url TEXT NOT NULL,
    
    -- UTM Parameters
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    
    -- Link Settings
    is_cloaked BOOLEAN DEFAULT TRUE,
    redirect_type INTEGER DEFAULT 301,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    
    -- Analytics
    clicks_count INTEGER DEFAULT 0,
    unique_clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0.00,
    last_clicked_at TIMESTAMPTZ,
    
    -- Security & Restrictions
    expires_at TIMESTAMPTZ,
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    geo_restrictions TEXT[] DEFAULT '{}',
    device_restrictions TEXT[] DEFAULT '{}',
    max_clicks INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: commissions (Comissões)
-- =====================================================
CREATE TABLE IF NOT EXISTS commissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    link_id UUID REFERENCES affiliate_links(id),
    
    -- Order Information
    order_id TEXT,
    customer_email TEXT,
    
    -- Financial Data
    gross_amount DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) DEFAULT 0.00,
    payment_processor_fee DECIMAL(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'BRL',
    
    -- Status & Workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled', 'disputed')),
    conversion_date TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    payment_date TIMESTAMPTZ,
    payment_reference TEXT,
    
    -- Disputes & Refunds
    refund_date TIMESTAMPTZ,
    refund_reason TEXT,
    dispute_reason TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: notifications (Notificações)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('commission', 'payment', 'product', 'system', 'achievement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_label TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent_email BOOLEAN DEFAULT FALSE,
    is_sent_push BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: link_analytics (Analytics de Links)
-- =====================================================
CREATE TABLE IF NOT EXISTS link_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Event Data
    event_type TEXT NOT NULL CHECK (event_type IN ('click', 'view', 'conversion', 'signup', 'purchase')),
    
    -- Request Information
    ip_address INET,
    user_agent TEXT,
    referer_url TEXT,
    
    -- Geolocation
    country_code TEXT,
    region TEXT,
    city TEXT,
    
    -- Device Information
    device_type TEXT,
    browser TEXT,
    operating_system TEXT,
    
    -- Session
    session_id TEXT,
    
    -- Conversion Data
    conversion_value DECIMAL(12,2),
    commission_earned DECIMAL(12,2),
    
    -- Additional Data
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: creatives (Materiais Criativos)
-- =====================================================
CREATE TABLE IF NOT EXISTS creatives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    
    -- Creative Info
    title TEXT NOT NULL,
    description TEXT,
    creative_type TEXT NOT NULL CHECK (creative_type IN ('banner', 'video', 'text', 'email', 'social', 'landing_page')),
    
    -- File Information
    file_url TEXT,
    thumbnail_url TEXT,
    dimensions TEXT,
    file_size_bytes BIGINT,
    file_format TEXT,
    duration_seconds INTEGER,
    
    -- Design Elements
    color_scheme TEXT[] DEFAULT '{}',
    copy_text TEXT,
    call_to_action TEXT,
    
    -- Targeting
    target_audience TEXT,
    performance_notes TEXT,
    
    -- Analytics
    download_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Settings
    is_featured BOOLEAN DEFAULT FALSE,
    is_exclusive BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_id ON profiles(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(affiliate_status);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = TRUE;

-- Courses & Lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active) WHERE is_active = TRUE;

-- Chat
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active) WHERE is_active = TRUE;

-- Affiliate Links
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user_id ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product_id ON affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_slug ON affiliate_links(custom_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_status ON affiliate_links(status);

-- Commissions
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_product_id ON commissions(product_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_conversion_date ON commissions(conversion_date);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_event_type ON link_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_link_analytics_created_at ON link_analytics(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- FUNÇÕES E TRIGGERS PARA AUTOMAÇÃO
-- =====================================================

-- Função para atualizar timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON affiliate_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar affiliate_id automático
CREATE OR REPLACE FUNCTION generate_affiliate_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.affiliate_id IS NULL AND NEW.affiliate_status = 'approved' THEN
        NEW.affiliate_id := 'AFF' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('affiliate_id_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Sequence para affiliate_id
CREATE SEQUENCE IF NOT EXISTS affiliate_id_seq START 1;

-- Trigger para gerar affiliate_id
CREATE TRIGGER generate_affiliate_id_trigger 
    BEFORE INSERT OR UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION generate_affiliate_id();

-- Função para atualizar estatísticas do perfil
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Atualizar total_earnings
        UPDATE profiles SET 
            total_earnings = (
                SELECT COALESCE(SUM(commission_amount), 0) 
                FROM commissions 
                WHERE user_id = NEW.user_id AND status = 'paid'
            ),
            total_conversions = (
                SELECT COUNT(*) 
                FROM commissions 
                WHERE user_id = NEW.user_id AND status IN ('approved', 'paid')
            )
        WHERE id = NEW.user_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para atualizar estatísticas
CREATE TRIGGER update_profile_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON commissions 
    FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Ativar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para products
CREATE POLICY "Everyone can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para courses
CREATE POLICY "Everyone can view active courses" ON courses FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para lessons
CREATE POLICY "Everyone can view active lessons" ON lessons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para chat_rooms
CREATE POLICY "Everyone can view active chat rooms" ON chat_rooms FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage chat rooms" ON chat_rooms FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para messages
CREATE POLICY "Everyone can view messages" ON messages FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can edit their own messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- Políticas para affiliate_links
CREATE POLICY "Users can view their own links" ON affiliate_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own links" ON affiliate_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all links" ON affiliate_links FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para commissions
CREATE POLICY "Users can view their own commissions" ON commissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all commissions" ON commissions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir sala "Comunidade da Elite"
INSERT INTO chat_rooms (name, description, is_active) 
VALUES (
    'Comunidade da Elite',
    'Sala oficial da comunidade de afiliados elite. Networking premium e discussões estratégicas.',
    TRUE
) ON CONFLICT DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description, color) VALUES
    ('Marketing Digital', 'marketing-digital', 'Produtos relacionados a marketing digital e vendas online', '#f59e0b'),
    ('Educação', 'educacao', 'Cursos e materiais educacionais', '#3b82f6'),
    ('Saúde e Bem-estar', 'saude-bem-estar', 'Produtos para saúde e qualidade de vida', '#10b981'),
    ('Tecnologia', 'tecnologia', 'Software, apps e ferramentas tecnológicas', '#8b5cf6'),
    ('Finanças', 'financas', 'Investimentos e educação financeira', '#ef4444')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para estatísticas do dashboard admin
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE affiliate_status = 'pending') as pending_affiliates,
    (SELECT COUNT(*) FROM profiles WHERE affiliate_status = 'approved') as approved_affiliates,
    (SELECT COUNT(*) FROM commissions WHERE status = 'pending') as pending_commissions,
    (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions WHERE status = 'pending') as pending_commissions_value,
    (SELECT COUNT(*) FROM commissions WHERE status = 'approved') as pending_payments,
    (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions WHERE status = 'approved') as pending_payments_value,
    (SELECT COUNT(*) FROM products WHERE status = 'active') as active_products,
    (SELECT COUNT(*) FROM courses WHERE is_active = TRUE) as active_courses;

-- =====================================================
-- FUNÇÕES UTILITÁRIAS
-- =====================================================

-- Função para registrar clique em link
CREATE OR REPLACE FUNCTION log_link_click(
    p_link_id UUID,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referer_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    analytics_id UUID;
    link_user_id UUID;
BEGIN
    -- Obter o user_id do link
    SELECT user_id INTO link_user_id FROM affiliate_links WHERE id = p_link_id;
    
    -- Inserir registro de analytics
    INSERT INTO link_analytics (
        id, link_id, user_id, event_type, ip_address, user_agent, referer_url, metadata
    ) VALUES (
        uuid_generate_v4(), p_link_id, link_user_id, 'click', p_ip_address, p_user_agent, p_referer_url, p_metadata
    ) RETURNING id INTO analytics_id;
    
    -- Atualizar contador no link
    UPDATE affiliate_links 
    SET 
        clicks_count = clicks_count + 1,
        last_clicked_at = NOW()
    WHERE id = p_link_id;
    
    RETURN analytics_id;
END;
$$;

-- Função para registrar conversão
CREATE OR REPLACE FUNCTION log_conversion(
    p_link_id UUID,
    p_order_id TEXT,
    p_customer_email TEXT,
    p_gross_amount DECIMAL,
    p_commission_rate DECIMAL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    commission_id UUID;
    link_user_id UUID;
    link_product_id UUID;
    commission_amount DECIMAL;
    net_amount DECIMAL;
BEGIN
    -- Obter dados do link
    SELECT user_id, product_id INTO link_user_id, link_product_id 
    FROM affiliate_links WHERE id = p_link_id;
    
    -- Calcular comissão
    commission_amount := p_gross_amount * (p_commission_rate / 100);
    net_amount := p_gross_amount - commission_amount;
    
    -- Inserir comissão
    INSERT INTO commissions (
        id, user_id, product_id, link_id, order_id, customer_email,
        gross_amount, commission_rate, commission_amount, net_amount
    ) VALUES (
        uuid_generate_v4(), link_user_id, link_product_id, p_link_id, p_order_id, p_customer_email,
        p_gross_amount, p_commission_rate, commission_amount, net_amount
    ) RETURNING id INTO commission_id;
    
    -- Inserir analytics de conversão
    INSERT INTO link_analytics (
        link_id, user_id, event_type, conversion_value, commission_earned, metadata
    ) VALUES (
        p_link_id, link_user_id, 'conversion', p_gross_amount, commission_amount, p_metadata
    );
    
    -- Atualizar contador de conversões
    UPDATE affiliate_links 
    SET 
        conversions_count = conversions_count + 1,
        revenue_generated = revenue_generated + commission_amount
    WHERE id = p_link_id;
    
    RETURN commission_id;
END;
$$;

-- Função para gerar relatório de performance
CREATE OR REPLACE FUNCTION generate_performance_report(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
    total_clicks INTEGER,
    unique_clicks INTEGER,
    total_conversions INTEGER,
    total_commissions DECIMAL,
    conversion_rate DECIMAL,
    avg_commission_value DECIMAL,
    top_products JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(al.clicks_count), 0)::INTEGER as total_clicks,
        COALESCE(SUM(al.unique_clicks_count), 0)::INTEGER as unique_clicks,
        COALESCE(SUM(al.conversions_count), 0)::INTEGER as total_conversions,
        COALESCE(SUM(c.commission_amount), 0) as total_commissions,
        CASE 
            WHEN COALESCE(SUM(al.clicks_count), 0) > 0 
            THEN (COALESCE(SUM(al.conversions_count), 0)::DECIMAL / SUM(al.clicks_count)) * 100
            ELSE 0
        END as conversion_rate,
        CASE 
            WHEN COALESCE(SUM(al.conversions_count), 0) > 0 
            THEN COALESCE(SUM(c.commission_amount), 0) / SUM(al.conversions_count)
            ELSE 0
        END as avg_commission_value,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'product_name', p.name,
                    'conversions', COUNT(c.id),
                    'commission_total', SUM(c.commission_amount)
                )
            )
            FROM commissions c
            JOIN products p ON p.id = c.product_id
            WHERE c.user_id = p_user_id 
                AND c.created_at BETWEEN p_start_date AND p_end_date
            GROUP BY p.id, p.name
            ORDER BY SUM(c.commission_amount) DESC
            LIMIT 5),
            '[]'::jsonb
        ) as top_products
    FROM affiliate_links al
    LEFT JOIN commissions c ON c.link_id = al.id 
        AND c.created_at BETWEEN p_start_date AND p_end_date
    WHERE al.user_id = p_user_id;
END;
$$; 