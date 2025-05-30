export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'affiliate' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'affiliate' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'affiliate' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          commission_rate: number;
          category_id: string | null;
          image_url: string | null;
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          commission_rate: number;
          category_id?: string | null;
          image_url?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          commission_rate?: number;
          category_id?: string | null;
          image_url?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      affiliate_links: {
        Row: {
          id: string;
          product_id: string;
          affiliate_id: string;
          unique_code: string;
          click_count: number;
          conversion_count: number;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          affiliate_id: string;
          unique_code: string;
          click_count?: number;
          conversion_count?: number;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          affiliate_id?: string;
          unique_code?: string;
          click_count?: number;
          conversion_count?: number;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      commissions: {
        Row: {
          id: string;
          affiliate_id: string;
          product_id: string;
          sale_amount: number;
          commission_amount: number;
          commission_rate: number;
          status: 'pending' | 'approved' | 'paid' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          product_id: string;
          sale_amount: number;
          commission_amount: number;
          commission_rate: number;
          status?: 'pending' | 'approved' | 'paid' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          product_id?: string;
          sale_amount?: number;
          commission_amount?: number;
          commission_rate?: number;
          status?: 'pending' | 'approved' | 'paid' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          affiliate_id: string;
          amount: number;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          payment_method: string | null;
          transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          amount: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          payment_method?: string | null;
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          amount?: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          payment_method?: string | null;
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_affiliate_stats: {
        Args: { affiliate_id: string };
        Returns: {
          total_sales: number;
          total_commissions: number;
          pending_commissions: number;
          click_count: number;
          conversion_rate: number;
        }[];
      };
      get_top_performing_products: {
        Args: { limit_count?: number };
        Returns: {
          id: string;
          name: string;
          total_sales: number;
          total_commissions: number;
        }[];
      };
    };
    Enums: {
      user_role: 'affiliate' | 'admin';
      product_status: 'active' | 'inactive' | 'pending';
      commission_status: 'pending' | 'approved' | 'paid' | 'cancelled';
      payment_status: 'pending' | 'processing' | 'completed' | 'failed';
      link_status: 'active' | 'inactive';
    };
  };
} 