-- Tabela de links de afiliado personalizados
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  custom_slug TEXT NOT NULL, -- Slug personalizado pelo afiliado
  full_url TEXT GENERATED ALWAYS AS (
    'https://afiliados.elite.com/go/' || custom_slug
  ) STORED,
  original_url TEXT NOT NULL, -- URL original do produto
  utm_source TEXT DEFAULT 'afiliados_elite',
  utm_medium TEXT DEFAULT 'affiliate',
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  is_cloaked BOOLEAN DEFAULT true, -- Se o link está mascarado
  redirect_type INTEGER DEFAULT 302, -- Tipo de redirect (301/302)
  status link_status DEFAULT 'active',
  clicks_count INTEGER DEFAULT 0,
  unique_clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  geo_restrictions TEXT[], -- Países permitidos
  device_restrictions TEXT[], -- Dispositivos permitidos (mobile, desktop, tablet)
  max_clicks INTEGER, -- Limite máximo de cliques
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(custom_slug),
  UNIQUE(user_id, product_id, custom_slug)
);

-- Tabela de analytics detalhado por link
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
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  operating_system TEXT,
  session_id TEXT,
  conversion_value DECIMAL(10,2),
  commission_earned DECIMAL(10,2),
  metadata JSONB, -- Dados adicionais flexíveis
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de comissões detalhadas
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  link_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
  order_id TEXT, -- ID do pedido no sistema do vendor
  customer_email TEXT,
  gross_amount DECIMAL(10,2) NOT NULL, -- Valor bruto da venda
  commission_rate DECIMAL(5,2) NOT NULL, -- Taxa aplicada
  commission_amount DECIMAL(10,2) NOT NULL, -- Valor da comissão
  net_amount DECIMAL(10,2) NOT NULL, -- Valor líquido após taxas
  platform_fee DECIMAL(10,2) DEFAULT 0, -- Taxa da plataforma
  payment_processor_fee DECIMAL(10,2) DEFAULT 0, -- Taxa do processador
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

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product ON affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_slug ON affiliate_links(custom_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_status ON affiliate_links(status);

CREATE INDEX IF NOT EXISTS idx_link_analytics_link ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_user ON link_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_event ON link_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_link_analytics_date ON link_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_link_analytics_ip ON link_analytics(ip_address);

CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_product ON commissions(product_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_date ON commissions(conversion_date);
CREATE INDEX IF NOT EXISTS idx_commissions_payment_date ON commissions(payment_date);

-- Triggers para updated_at
CREATE TRIGGER update_affiliate_links_updated_at
    BEFORE UPDATE ON affiliate_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 