export type AffiliateStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AffiliateProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  document_number?: string;
  date_of_birth?: string;
  address?: Record<string, any>;
  affiliate_status: AffiliateStatus;
  affiliate_id: string;
  commission_rate: number;
  total_earnings: number;
  total_clicks: number;
  total_conversions: number;
  approved_at?: string;
  bio?: string;
  social_media?: Record<string, any>;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateLink {
  id: string;
  affiliate_id: string;
  product_id: string;
  short_code: string;
  original_url: string;
  custom_params?: Record<string, any>;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateStats {
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  conversion_rate: number;
  active_links: number;
} 