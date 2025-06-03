-- =====================================================
-- MIGRAÇÃO: Adicionar suporte a múltiplas ofertas por produto
-- Data: 2025-01-30
-- Descrição: Cria estrutura para produtos com múltiplos preços e comissões
-- =====================================================

-- Tabela de ofertas de produtos
CREATE TABLE IF NOT EXISTS product_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  
  -- Informações da oferta
  name TEXT NOT NULL, -- Ex: "Oferta Básica", "Oferta Premium", "Oferta Completa"
  description TEXT, -- Descrição detalhada da oferta
  
  -- Preços e comissões
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2), -- Preço original (para mostrar desconto)
  commission_rate DECIMAL(5,2) NOT NULL, -- Percentual de comissão específico
  commission_amount DECIMAL(10,2), -- Valor fixo de comissão (opcional)
  
  -- Link específico da oferta
  affiliate_link TEXT NOT NULL,
  
  -- Configurações
  is_default BOOLEAN DEFAULT false, -- Se é a oferta padrão do produto
  is_active BOOLEAN DEFAULT true,
  
  -- Ordenação para exibição
  sort_order INTEGER DEFAULT 0,
  
  -- Datas de vigência
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que só existe uma oferta padrão por produto
  CONSTRAINT unique_default_offer_per_product 
    EXCLUDE (product_id WITH =) WHERE (is_default = true)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_product_offers_product_id ON product_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_is_default ON product_offers(is_default);
CREATE INDEX IF NOT EXISTS idx_product_offers_is_active ON product_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_product_offers_sort_order ON product_offers(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_offers_validity ON product_offers(valid_from, valid_until);

-- Trigger para updated_at
CREATE TRIGGER update_product_offers_updated_at
    BEFORE UPDATE ON product_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para migrar dados existentes
DO $$
BEGIN
  -- Migrar produtos existentes para ter uma oferta padrão
  INSERT INTO product_offers (
    product_id, 
    name, 
    description, 
    price, 
    original_price, 
    commission_rate, 
    commission_amount,
    affiliate_link,
    is_default,
    is_active
  )
  SELECT 
    id,
    'Oferta Principal' as name,
    'Oferta principal do produto' as description,
    COALESCE(price, 0) as price,
    original_price,
    commission_rate,
    commission_amount,
    affiliate_link,
    true as is_default,
    CASE WHEN status = 'active' THEN true ELSE false END as is_active
  FROM products 
  WHERE id NOT IN (
    SELECT DISTINCT product_id 
    FROM product_offers 
    WHERE is_default = true
  );
  
  RAISE NOTICE 'Migração de ofertas concluída com sucesso';
END $$;

-- Comentários para documentação
COMMENT ON TABLE product_offers IS 'Tabela para armazenar múltiplas ofertas (preços/comissões) por produto';
COMMENT ON COLUMN product_offers.name IS 'Nome da oferta (ex: Básica, Premium, Completa)';
COMMENT ON COLUMN product_offers.price IS 'Preço da oferta';
COMMENT ON COLUMN product_offers.commission_rate IS 'Percentual de comissão específico da oferta';
COMMENT ON COLUMN product_offers.is_default IS 'Se é a oferta padrão exibida para o produto';
COMMENT ON COLUMN product_offers.sort_order IS 'Ordem de exibição das ofertas';
COMMENT ON COLUMN product_offers.metadata IS 'Dados adicionais flexíveis da oferta';

-- Atualizar tabela de affiliate_links para referenciar oferta específica
ALTER TABLE affiliate_links 
ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES product_offers(id) ON DELETE SET NULL;

-- Atualizar tabela de commissions para referenciar oferta específica  
ALTER TABLE commissions
ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES product_offers(id) ON DELETE SET NULL;

-- Índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_affiliate_links_offer_id ON affiliate_links(offer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_offer_id ON commissions(offer_id);

-- Função para obter oferta padrão ou primeira ativa de um produto
CREATE OR REPLACE FUNCTION get_product_default_offer(product_uuid UUID)
RETURNS product_offers AS $$
DECLARE
  offer_record product_offers;
BEGIN
  -- Tentar pegar a oferta marcada como padrão
  SELECT * INTO offer_record
  FROM product_offers 
  WHERE product_id = product_uuid 
    AND is_default = true 
    AND is_active = true
  LIMIT 1;
  
  -- Se não encontrou oferta padrão, pegar a primeira ativa
  IF NOT FOUND THEN
    SELECT * INTO offer_record
    FROM product_offers 
    WHERE product_id = product_uuid 
      AND is_active = true
    ORDER BY sort_order, created_at
    LIMIT 1;
  END IF;
  
  RETURN offer_record;
END;
$$ LANGUAGE plpgsql;

-- View para facilitar consultas de produtos com suas ofertas
CREATE OR REPLACE VIEW products_with_offers AS
SELECT 
  p.*,
  -- Oferta padrão
  po_default.id as default_offer_id,
  po_default.name as default_offer_name,
  po_default.price as default_offer_price,
  po_default.original_price as default_offer_original_price,
  po_default.commission_rate as default_offer_commission_rate,
  po_default.affiliate_link as default_offer_affiliate_link,
  
  -- Estatísticas das ofertas
  (SELECT COUNT(*) FROM product_offers WHERE product_id = p.id AND is_active = true) as total_offers,
  (SELECT MIN(price) FROM product_offers WHERE product_id = p.id AND is_active = true) as min_price,
  (SELECT MAX(price) FROM product_offers WHERE product_id = p.id AND is_active = true) as max_price
FROM products p
LEFT JOIN product_offers po_default ON (
  p.id = po_default.product_id 
  AND po_default.is_default = true 
  AND po_default.is_active = true
);

COMMENT ON VIEW products_with_offers IS 'View que combina produtos com suas ofertas padrão e estatísticas'; 