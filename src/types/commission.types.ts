export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';
export type PaymentMethod = 'pix' | 'bank_transfer' | 'paypal';

export interface Commission {
  id: string;
  affiliate_id: string;
  product_id: string;
  link_id: string;
  amount: number;
  status: CommissionStatus;
  conversion_data?: Record<string, any>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  affiliate_id: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transaction_id?: string;
  payment_details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LinkAnalytics {
  id: string;
  link_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  device_type?: string;
  clicked_at: string;
} 