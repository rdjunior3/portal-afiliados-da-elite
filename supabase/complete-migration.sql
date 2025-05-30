-- MIGRAÇÃO COMPLETA PORTAL AFILIADOS DA ELITE
-- Execute este SQL no SQL Editor do Supabase

-- 1. EXTENSÕES E CONFIGURAÇÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configurar timezone padrão
SET timezone = 'America/Sao_Paulo';

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. TIPOS CUSTOMIZADOS (ENUMS)
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled', 'disputed');
CREATE TYPE analytics_event_type AS ENUM ('click', 'view', 'conversion', 'signup', 'purchase');
CREATE TYPE creative_type AS ENUM ('banner', 'video', 'text', 'email', 'social', 'landing_page');
CREATE TYPE link_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE notification_type AS ENUM ('commission', 'payment', 'product', 'system', 'achievement');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE payment_method AS ENUM ('pix', 'bank_transfer', 'paypal', 'crypto');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- 3. ATUALIZAR TABELA PROFILES
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS document_number TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_youtube TEXT,
ADD COLUMN IF NOT EXISTS social_tiktok TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS affiliate_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS total_commissions DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

-- Gerar códigos únicos para usuários existentes
UPDATE profiles 
SET 
  affiliate_code = CONCAT('AFF', UPPER(SUBSTRING(MD5(id::text), 1, 8))),
  referral_code = CONCAT('REF', UPPER(SUBSTRING(MD5(id::text || created_at::text), 1, 8)))
WHERE affiliate_code IS NULL OR referral_code IS NULL;

-- 4. CRIAR TABELAS DE CATEGORIAS E PRODUTOS
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#4ade80',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  images TEXT[],
  video_url TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2),
  affiliate_link TEXT NOT NULL,
  tracking_pixel TEXT,
  vendor_name TEXT,
  vendor_email TEXT,
  vendor_website TEXT,
  conversion_flow TEXT,
  target_audience TEXT,
  keywords TEXT[],
  tags TEXT[],
  gravity_score INTEGER DEFAULT 0,
  earnings_per_click DECIMAL(10,4) DEFAULT 0,
  conversion_rate_avg DECIMAL(5,2) DEFAULT 0,
  refund_rate DECIMAL(5,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  min_payout DECIMAL(10,2) DEFAULT 0,
  status product_status DEFAULT 'pending',
  launch_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  UNIQUE(product_id, user_id)
);

-- 5. CRIAR TABELAS DE LINKS E ANALYTICS
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  custom_slug TEXT NOT NULL,
  full_url TEXT GENERATED ALWAYS AS (
    'https://afiliados.elite.com/go/' || custom_slug
  ) STORED,
  original_url TEXT NOT NULL,
  utm_source TEXT DEFAULT 'afiliados_elite',
  utm_medium TEXT DEFAULT 'affiliate',
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  is_cloaked BOOLEAN DEFAULT true,
  redirect_type INTEGER DEFAULT 302,
  status link_status DEFAULT 'active',
  clicks_count INTEGER DEFAULT 0,
  unique_clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  geo_restrictions TEXT[],
  device_restrictions TEXT[],
  max_clicks INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(custom_slug),
  UNIQUE(user_id, product_id, custom_slug)
);

CREATE TABLE IF NOT EXISTS link_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type analytics_event_type NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referer_url TEXT,
  country_code CHAR(2),
  region TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  session_id TEXT,
  conversion_value DECIMAL(10,2),
  commission_earned DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
  order_id TEXT,
  customer_email TEXT,
  gross_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  payment_processor_fee DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  status commission_status DEFAULT 'pending',
  conversion_date TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  payment_date TIMESTAMPTZ,
  payment_reference TEXT,
  refund_date TIMESTAMPTZ,
  refund_reason TEXT,
  dispute_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CRIAR TABELAS DE CRIATIVOS
CREATE TABLE IF NOT EXISTS creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  creative_type creative_type NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  dimensions TEXT,
  file_size_bytes BIGINT,
  file_format TEXT,
  duration_seconds INTEGER,
  color_scheme TEXT[],
  copy_text TEXT,
  call_to_action TEXT,
  target_audience TEXT,
  performance_notes TEXT,
  download_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CRIAR TABELAS DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT false,
  is_sent_email BOOLEAN DEFAULT false,
  is_sent_push BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  metadata JSONB,
  expires_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  notify_new_commission BOOLEAN DEFAULT true,
  notify_payment_processed BOOLEAN DEFAULT true,
  notify_new_product BOOLEAN DEFAULT true,
  notify_performance_reports BOOLEAN DEFAULT true,
  notify_system_updates BOOLEAN DEFAULT true,
  notify_marketing_tips BOOLEAN DEFAULT false,
  weekly_report BOOLEAN DEFAULT true,
  monthly_report BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 8. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

CREATE INDEX IF NOT EXISTS idx_affiliate_links_user ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product ON affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_slug ON affiliate_links(custom_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_status ON affiliate_links(status);

CREATE INDEX IF NOT EXISTS idx_link_analytics_link ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_user ON link_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_event ON link_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_link_analytics_date ON link_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_product ON commissions(product_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_date ON commissions(conversion_date);

-- 9. CRIAR TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
    BEFORE UPDATE ON affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creatives_updated_at
    BEFORE UPDATE ON creatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. INSERIR CATEGORIAS PADRÃO
INSERT INTO categories (name, slug, description, icon_url, color) VALUES
('Marketing Digital', 'marketing-digital', 'Cursos e ferramentas de marketing digital', '/icons/marketing.svg', '#4ade80'),
('Negócios Online', 'negocios-online', 'Oportunidades de negócios na internet', '/icons/business.svg', '#3b82f6'),
('Educação', 'educacao', 'Cursos e treinamentos educacionais', '/icons/education.svg', '#f59e0b'),
('Saúde e Bem-estar', 'saude-bem-estar', 'Produtos de saúde e qualidade de vida', '/icons/health.svg', '#ef4444'),
('Finanças', 'financas', 'Investimentos e educação financeira', '/icons/finance.svg', '#10b981'),
('Tecnologia', 'tecnologia', 'Software e ferramentas digitais', '/icons/tech.svg', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- 11. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- 12. CRIAR POLÍTICAS RLS
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
    FOR INSERT WITH CHECK (true);

-- Políticas para COMMISSIONS
CREATE POLICY "Users can view own commissions" ON commissions
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas para CREATIVES (público para leitura de ativos)
CREATE POLICY "Anyone can view active creatives" ON creatives
    FOR SELECT USING (is_active = true);

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

-- 13. FUNÇÕES DE ANALYTICS
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

-- Função para criar preferências automaticamente
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

-- 🎉 MIGRAÇÃO COMPLETA FINALIZADA! 🎉 