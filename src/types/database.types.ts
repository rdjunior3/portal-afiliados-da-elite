export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          document_number: string | null;
          date_of_birth: string | null;
          bio: string | null;
          website_url: string | null;
          social_media: any | null;
          role: 'user' | 'affiliate' | 'moderator' | 'admin' | 'super_admin';
          affiliate_status: 'pending' | 'approved' | 'rejected' | 'suspended';
          affiliate_id: string | null;
          affiliate_code: string | null;
          referral_code: string | null;
          referred_by: string | null;
          commission_rate: number;
          total_earnings: number;
          total_clicks: number;
          total_conversions: number;
          conversion_rate: number;
          last_activity_at: string | null;
          onboarding_completed_at: string | null;
          terms_accepted_at: string | null;
          privacy_accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          document_number?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          website_url?: string | null;
          social_media?: any | null;
          role?: 'user' | 'affiliate' | 'moderator' | 'admin' | 'super_admin';
          affiliate_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          affiliate_id?: string | null;
          affiliate_code?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          commission_rate?: number;
          total_earnings?: number;
          total_clicks?: number;
          total_conversions?: number;
          conversion_rate?: number;
          last_activity_at?: string | null;
          onboarding_completed_at?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          document_number?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          website_url?: string | null;
          social_media?: any | null;
          role?: 'user' | 'affiliate' | 'moderator' | 'admin' | 'super_admin';
          affiliate_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          affiliate_id?: string | null;
          affiliate_code?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          commission_rate?: number;
          total_earnings?: number;
          total_clicks?: number;
          total_conversions?: number;
          conversion_rate?: number;
          last_activity_at?: string | null;
          onboarding_completed_at?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_url: string | null;
          color: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon_url?: string | null;
          color?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon_url?: string | null;
          color?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          image_url: string | null;
          thumbnail_url: string | null;
          images: string[];
          video_url: string | null;
          price: number | null;
          original_price: number | null;
          currency: string;
          commission_rate: number;
          commission_amount: number | null;
          sales_page_url: string;
          affiliate_link: string | null;
          tracking_pixel: string | null;
          gravity_score: number;
          earnings_per_click: number;
          conversion_rate_avg: number;
          refund_rate: number;
          total_sales: number;
          is_featured: boolean;
          is_exclusive: boolean;
          is_active: boolean;
          requires_approval: boolean;
          min_payout: number;
          status: 'active' | 'inactive' | 'pending' | 'archived';
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          image_url?: string | null;
          thumbnail_url?: string | null;
          images?: string[];
          video_url?: string | null;
          price?: number | null;
          original_price?: number | null;
          currency?: string;
          commission_rate?: number;
          commission_amount?: number | null;
          sales_page_url: string;
          affiliate_link?: string | null;
          tracking_pixel?: string | null;
          gravity_score?: number;
          earnings_per_click?: number;
          conversion_rate_avg?: number;
          refund_rate?: number;
          total_sales?: number;
          is_featured?: boolean;
          is_exclusive?: boolean;
          is_active?: boolean;
          requires_approval?: boolean;
          min_payout?: number;
          status?: 'active' | 'inactive' | 'pending' | 'archived';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          image_url?: string | null;
          thumbnail_url?: string | null;
          images?: string[];
          video_url?: string | null;
          price?: number | null;
          original_price?: number | null;
          currency?: string;
          commission_rate?: number;
          commission_amount?: number | null;
          sales_page_url?: string;
          affiliate_link?: string | null;
          tracking_pixel?: string | null;
          gravity_score?: number;
          earnings_per_click?: number;
          conversion_rate_avg?: number;
          refund_rate?: number;
          total_sales?: number;
          is_featured?: boolean;
          is_exclusive?: boolean;
          is_active?: boolean;
          requires_approval?: boolean;
          min_payout?: number;
          status?: 'active' | 'inactive' | 'pending' | 'archived';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      product_offers: {
        Row: {
          id: string;
          product_id: string | null;
          name: string;
          description: string | null;
          price: number;
          original_price: number | null;
          commission_rate: number;
          commission_amount: number | null;
          promotion_url: string | null;
          is_default: boolean;
          is_active: boolean;
          valid_from: string | null;
          valid_until: string | null;
          metadata: any;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          original_price?: number | null;
          commission_rate: number;
          commission_amount?: number | null;
          promotion_url?: string | null;
          is_default?: boolean;
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
          metadata?: any;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          original_price?: number | null;
          commission_rate?: number;
          commission_amount?: number | null;
          promotion_url?: string | null;
          is_default?: boolean;
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
          metadata?: any;
          sort_order?: number;
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