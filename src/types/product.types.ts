export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  commission_rate: number;
  category_id?: string;
  image_url?: string;
  sales_page_url: string;
  is_active: boolean;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
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