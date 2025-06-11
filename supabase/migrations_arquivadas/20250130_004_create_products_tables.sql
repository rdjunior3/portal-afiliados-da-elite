-- Tabela de categorias de produtos
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

-- Tabela de produtos/ofertas
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  images TEXT[], -- Array de URLs de imagens
  video_url TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  commission_rate DECIMAL(5,2) NOT NULL, -- Percentual de comissão (ex: 50.00 para 50%)
  commission_amount DECIMAL(10,2), -- Valor fixo de comissão (opcional)
  affiliate_link TEXT NOT NULL,
  tracking_pixel TEXT, -- Para tracking de conversões
  vendor_name TEXT,
  vendor_email TEXT,
  vendor_website TEXT,
  conversion_flow TEXT, -- Descrição do fluxo de conversão
  target_audience TEXT, -- Público-alvo
  keywords TEXT[], -- Palavras-chave para busca
  tags TEXT[], -- Tags para organização
  gravity_score INTEGER DEFAULT 0, -- Score de popularidade
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

-- Tabela de aprovações de produtos por afiliado
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_product_approvals_user ON product_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_product_approvals_product ON product_approvals(product_id);

-- Triggers para updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description, icon_url, color) VALUES
('Marketing Digital', 'marketing-digital', 'Cursos e ferramentas de marketing digital', '/icons/marketing.svg', '#4ade80'),
('Negócios Online', 'negocios-online', 'Oportunidades de negócios na internet', '/icons/business.svg', '#3b82f6'),
('Educação', 'educacao', 'Cursos e treinamentos educacionais', '/icons/education.svg', '#f59e0b'),
('Saúde e Bem-estar', 'saude-bem-estar', 'Produtos de saúde e qualidade de vida', '/icons/health.svg', '#ef4444'),
('Finanças', 'financas', 'Investimentos e educação financeira', '/icons/finance.svg', '#10b981'),
('Tecnologia', 'tecnologia', 'Software e ferramentas digitais', '/icons/tech.svg', '#8b5cf6'); 