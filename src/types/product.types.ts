export interface Product {
  id: string;
  category_id?: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  thumbnail_url?: string;
  images?: string[];
  video_url?: string;
  price?: number;
  original_price?: number;
  currency: string;
  commission_rate: number;
  commission_amount?: number;
  affiliate_link: string;
  tracking_pixel?: string;
  vendor_name?: string;
  vendor_email?: string;
  vendor_website?: string;
  conversion_flow?: string;
  target_audience?: string;
  keywords?: string[];
  tags?: string[];
  gravity_score: number;
  earnings_per_click: number;
  conversion_rate_avg: number;
  refund_rate: number;
  is_featured: boolean;
  is_exclusive: boolean;
  requires_approval: boolean;
  min_payout: number;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  launch_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductApproval {
  id: string;
  product_id: string;
  affiliate_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approved_at?: string;
  created_at: string;
}

// Interface para formulários de criação/edição simplificada
export interface ProductFormData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  commission_rate: number;
  category_id?: string;
  affiliate_link: string;
  thumbnail_url?: string;
  status?: 'active' | 'inactive' | 'pending' | 'archived';
  is_featured?: boolean;
  is_exclusive?: boolean;
} 