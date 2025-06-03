// Tipos para o sistema de ofertas de produtos
export interface ProductOffer {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  commission_rate: number;
  commission_amount?: number;
  affiliate_link: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  valid_from?: string;
  valid_until?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductOfferInsert {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  commission_rate: number;
  commission_amount?: number;
  affiliate_link: string;
  is_default?: boolean;
  is_active?: boolean;
  sort_order?: number;
  valid_from?: string;
  valid_until?: string;
  metadata?: Record<string, any>;
}

export interface ProductOfferUpdate {
  name?: string;
  description?: string;
  price?: number;
  original_price?: number;
  commission_rate?: number;
  commission_amount?: number;
  affiliate_link?: string;
  is_default?: boolean;
  is_active?: boolean;
  sort_order?: number;
  valid_from?: string;
  valid_until?: string;
  metadata?: Record<string, any>;
}

// Produto com suas ofertas
export interface ProductWithOffers {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  thumbnail_url?: string;
  category_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Oferta padrão
  default_offer_id?: string;
  default_offer_name?: string;
  default_offer_price?: number;
  default_offer_original_price?: number;
  default_offer_commission_rate?: number;
  default_offer_affiliate_link?: string;
  
  // Estatísticas das ofertas
  total_offers?: number;
  min_price?: number;
  max_price?: number;
  
  // Todas as ofertas (quando carregadas separadamente)
  offers?: ProductOffer[];
}

// Para formulários de criação/edição
export interface ProductOfferFormData {
  name: string;
  description: string;
  price: number;
  original_price: number;
  commission_rate: number;
  commission_amount: number;
  affiliate_link: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  valid_from?: string;
  valid_until?: string;
}

// Para exibição de preços com desconto
export interface OfferPricing {
  price: number;
  original_price?: number;
  discount_percentage?: number;
  commission_value: number;
  commission_rate: number;
}

// Utilitário para calcular preços
export const calculateOfferPricing = (offer: ProductOffer): OfferPricing => {
  const commission_value = offer.commission_amount || (offer.price * offer.commission_rate / 100);
  const discount_percentage = offer.original_price 
    ? Math.round(((offer.original_price - offer.price) / offer.original_price) * 100)
    : undefined;

  return {
    price: offer.price,
    original_price: offer.original_price,
    discount_percentage,
    commission_value,
    commission_rate: offer.commission_rate
  };
};

// Utilitário para validar oferta
export const validateOffer = (offer: Partial<ProductOfferFormData>): string[] => {
  const errors: string[] = [];

  if (!offer.name?.trim()) {
    errors.push('Nome da oferta é obrigatório');
  }

  if (!offer.price || offer.price <= 0) {
    errors.push('Preço deve ser maior que zero');
  }

  if (offer.original_price && offer.original_price <= offer.price!) {
    errors.push('Preço original deve ser maior que o preço atual');
  }

  if (!offer.commission_rate || offer.commission_rate < 0 || offer.commission_rate > 100) {
    errors.push('Taxa de comissão deve estar entre 0% e 100%');
  }

  if (!offer.affiliate_link?.trim()) {
    errors.push('Link de afiliado é obrigatório');
  }

  return errors;
};

// Para ordenação de ofertas
export const sortOffers = (offers: ProductOffer[]): ProductOffer[] => {
  return [...offers].sort((a, b) => {
    // Ofertas padrão primeiro
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    
    // Depois por sort_order
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    
    // Por último, por preço (menor primeiro)
    return a.price - b.price;
  });
}; 