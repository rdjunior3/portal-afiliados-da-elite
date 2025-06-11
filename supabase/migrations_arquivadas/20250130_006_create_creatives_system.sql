-- Tabela de criativos/materiais
CREATE TABLE IF NOT EXISTS creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  creative_type creative_type NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  dimensions TEXT, -- ex: "1080x1080", "1920x1080"
  file_size_bytes BIGINT,
  file_format TEXT, -- jpg, png, mp4, etc
  duration_seconds INTEGER, -- Para vídeos
  color_scheme TEXT[], -- Cores predominantes
  copy_text TEXT, -- Texto do criativo
  call_to_action TEXT, -- CTA principal
  target_audience TEXT,
  performance_notes TEXT, -- Dicas de como usar
  download_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  metadata JSONB, -- Dados adicionais flexíveis
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de downloads de criativos
CREATE TABLE IF NOT EXISTS creative_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creative_id, user_id) -- Evita downloads duplicados por usuário
);

-- Tabela de campanhas de email marketing
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  sender_name TEXT DEFAULT 'Afiliados da Elite',
  sender_email TEXT DEFAULT 'noreply@afiliados.elite.com',
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de templates de landing pages
CREATE TABLE IF NOT EXISTS landing_page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL,
  css_content TEXT,
  js_content TEXT,
  thumbnail_url TEXT,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  is_mobile_optimized BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[],
  variables JSONB, -- Variáveis customizáveis no template
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de swipe copy (textos prontos)
CREATE TABLE IF NOT EXISTS swipe_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  copy_type TEXT NOT NULL, -- 'social_post', 'email_subject', 'ad_copy', 'review', 'story'
  platform TEXT, -- 'facebook', 'instagram', 'twitter', 'linkedin', 'email'
  character_count INTEGER,
  hashtags TEXT[],
  mentions TEXT[],
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_creatives_product ON creatives(product_id);
CREATE INDEX IF NOT EXISTS idx_creatives_type ON creatives(creative_type);
CREATE INDEX IF NOT EXISTS idx_creatives_featured ON creatives(is_featured);
CREATE INDEX IF NOT EXISTS idx_creatives_active ON creatives(is_active);

CREATE INDEX IF NOT EXISTS idx_creative_downloads_creative ON creative_downloads(creative_id);
CREATE INDEX IF NOT EXISTS idx_creative_downloads_user ON creative_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_creative_downloads_date ON creative_downloads(downloaded_at);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_product ON email_campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_active ON email_campaigns(is_active);

CREATE INDEX IF NOT EXISTS idx_landing_templates_product ON landing_page_templates(product_id);
CREATE INDEX IF NOT EXISTS idx_landing_templates_featured ON landing_page_templates(is_featured);

CREATE INDEX IF NOT EXISTS idx_swipe_copies_product ON swipe_copies(product_id);
CREATE INDEX IF NOT EXISTS idx_swipe_copies_type ON swipe_copies(copy_type);
CREATE INDEX IF NOT EXISTS idx_swipe_copies_platform ON swipe_copies(platform);

-- Triggers para updated_at
CREATE TRIGGER update_creatives_updated_at
    BEFORE UPDATE ON creatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_page_templates_updated_at
    BEFORE UPDATE ON landing_page_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swipe_copies_updated_at
    BEFORE UPDATE ON swipe_copies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 