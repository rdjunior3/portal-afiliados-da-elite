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
          affiliate_status: 'pending' | 'approved' | 'rejected' | 'suspended';
          affiliate_id: string | null;
          commission_rate: number;
          total_earnings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'affiliate' | 'admin';
          affiliate_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          affiliate_id?: string | null;
          commission_rate?: number;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'affiliate' | 'admin';
          affiliate_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          affiliate_id?: string | null;
          commission_rate?: number;
          total_earnings?: number;
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
          sales_page_url: string;
          is_active: boolean;
          total_sales: number;
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
          sales_page_url: string;
          is_active?: boolean;
          total_sales?: number;
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
          sales_page_url?: string;
          is_active?: boolean;
          total_sales?: number;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          video_url: string | null;
          duration_seconds: number | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          video_url?: string | null;
          duration_seconds?: number | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          video_url?: string | null;
          duration_seconds?: number | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      materials: {
        Row: {
          id: string;
          lesson_id: string | null;
          course_id: string | null;
          title: string;
          file_url: string;
          file_type: string | null;
          file_size: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id?: string | null;
          course_id?: string | null;
          title: string;
          file_url: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string | null;
          course_id?: string | null;
          title?: string;
          file_url?: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          content: string;
          edited: boolean;
          edited_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          content: string;
          edited?: boolean;
          edited_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          sender_id?: string;
          content?: string;
          edited?: boolean;
          edited_at?: string | null;
          created_at?: string;
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
      admin_dashboard_stats: {
        Row: {
          pending_affiliates: number;
          approved_affiliates: number;
          pending_commissions: number;
          pending_commissions_value: number | null;
          pending_payments: number;
          pending_payments_value: number | null;
          active_products: number;
          active_courses: number;
        };
      };
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
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'affiliate' | 'admin';
      affiliate_status: 'pending' | 'approved' | 'rejected' | 'suspended';
      product_status: 'active' | 'inactive' | 'pending';
      commission_status: 'pending' | 'approved' | 'paid' | 'cancelled';
      payment_status: 'pending' | 'processing' | 'completed' | 'failed';
      link_status: 'active' | 'inactive';
    };
  };
} 