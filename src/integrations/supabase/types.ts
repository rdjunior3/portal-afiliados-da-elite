export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          id: string
          user_id: string
          product_id: string
          custom_slug: string
          full_url: string
          original_url: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_term: string | null
          is_cloaked: boolean
          redirect_type: number
          status: 'active' | 'inactive' | 'expired'
          clicks_count: number
          unique_clicks_count: number
          conversions_count: number
          revenue_generated: number
          last_clicked_at: string | null
          expires_at: string | null
          password_protected: boolean
          password_hash: string | null
          geo_restrictions: string[] | null
          device_restrictions: string[] | null
          max_clicks: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          custom_slug: string
          original_url: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          is_cloaked?: boolean
          redirect_type?: number
          status?: 'active' | 'inactive' | 'expired'
          clicks_count?: number
          unique_clicks_count?: number
          conversions_count?: number
          revenue_generated?: number
          last_clicked_at?: string | null
          expires_at?: string | null
          password_protected?: boolean
          password_hash?: string | null
          geo_restrictions?: string[] | null
          device_restrictions?: string[] | null
          max_clicks?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          custom_slug?: string
          original_url?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          is_cloaked?: boolean
          redirect_type?: number
          status?: 'active' | 'inactive' | 'expired'
          clicks_count?: number
          unique_clicks_count?: number
          conversions_count?: number
          revenue_generated?: number
          last_clicked_at?: string | null
          expires_at?: string | null
          password_protected?: boolean
          password_hash?: string | null
          geo_restrictions?: string[] | null
          device_restrictions?: string[] | null
          max_clicks?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_url: string | null
          color: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon_url?: string | null
          color?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon_url?: string | null
          color?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      commissions: {
        Row: {
          id: string
          user_id: string
          product_id: string
          link_id: string | null
          order_id: string | null
          customer_email: string | null
          gross_amount: number
          commission_rate: number
          commission_amount: number
          net_amount: number
          platform_fee: number
          payment_processor_fee: number
          currency: string
          status: 'pending' | 'approved' | 'paid' | 'cancelled' | 'disputed'
          conversion_date: string
          approved_at: string | null
          approved_by: string | null
          payment_date: string | null
          payment_reference: string | null
          refund_date: string | null
          refund_reason: string | null
          dispute_reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          link_id?: string | null
          order_id?: string | null
          customer_email?: string | null
          gross_amount: number
          commission_rate: number
          commission_amount: number
          net_amount: number
          platform_fee?: number
          payment_processor_fee?: number
          currency?: string
          status?: 'pending' | 'approved' | 'paid' | 'cancelled' | 'disputed'
          conversion_date?: string
          approved_at?: string | null
          approved_by?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          refund_date?: string | null
          refund_reason?: string | null
          dispute_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          link_id?: string | null
          order_id?: string | null
          customer_email?: string | null
          gross_amount?: number
          commission_rate?: number
          commission_amount?: number
          net_amount?: number
          platform_fee?: number
          payment_processor_fee?: number
          currency?: string
          status?: 'pending' | 'approved' | 'paid' | 'cancelled' | 'disputed'
          conversion_date?: string
          approved_at?: string | null
          approved_by?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          refund_date?: string | null
          refund_reason?: string | null
          dispute_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          short_description: string | null
          description: string | null
          thumbnail_url: string | null
          images: string[] | null
          video_url: string | null
          price: number | null
          original_price: number | null
          currency: string
          commission_rate: number
          commission_amount: number | null
          affiliate_link: string
          tracking_pixel: string | null
          vendor_name: string | null
          vendor_email: string | null
          vendor_website: string | null
          conversion_flow: string | null
          target_audience: string | null
          keywords: string[] | null
          tags: string[] | null
          gravity_score: number
          earnings_per_click: number
          conversion_rate_avg: number
          refund_rate: number
          is_featured: boolean
          is_exclusive: boolean
          requires_approval: boolean
          min_payout: number
          status: 'active' | 'inactive' | 'pending' | 'archived'
          launch_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          short_description?: string | null
          description?: string | null
          thumbnail_url?: string | null
          images?: string[] | null
          video_url?: string | null
          price?: number | null
          original_price?: number | null
          currency?: string
          commission_rate: number
          commission_amount?: number | null
          affiliate_link: string
          tracking_pixel?: string | null
          vendor_name?: string | null
          vendor_email?: string | null
          vendor_website?: string | null
          conversion_flow?: string | null
          target_audience?: string | null
          keywords?: string[] | null
          tags?: string[] | null
          gravity_score?: number
          earnings_per_click?: number
          conversion_rate_avg?: number
          refund_rate?: number
          is_featured?: boolean
          is_exclusive?: boolean
          requires_approval?: boolean
          min_payout?: number
          status?: 'active' | 'inactive' | 'pending' | 'archived'
          launch_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          short_description?: string | null
          description?: string | null
          thumbnail_url?: string | null
          images?: string[] | null
          video_url?: string | null
          price?: number | null
          original_price?: number | null
          currency?: string
          commission_rate?: number
          commission_amount?: number | null
          affiliate_link?: string
          tracking_pixel?: string | null
          vendor_name?: string | null
          vendor_email?: string | null
          vendor_website?: string | null
          conversion_flow?: string | null
          target_audience?: string | null
          keywords?: string[] | null
          tags?: string[] | null
          gravity_score?: number
          earnings_per_click?: number
          conversion_rate_avg?: number
          refund_rate?: number
          is_featured?: boolean
          is_exclusive?: boolean
          requires_approval?: boolean
          min_payout?: number
          status?: 'active' | 'inactive' | 'pending' | 'archived'
          launch_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          phone: string | null
          document_number: string | null
          birth_date: string | null
          bio: string | null
          website_url: string | null
          social_instagram: string | null
          social_youtube: string | null
          social_tiktok: string | null
          social_linkedin: string | null
          status: 'active' | 'inactive' | 'pending' | 'suspended'
          affiliate_code: string | null
          referral_code: string | null
          referred_by: string | null
          total_commissions: number
          total_clicks: number
          total_conversions: number
          conversion_rate: number
          last_activity_at: string | null
          onboarding_completed_at: string | null
          terms_accepted_at: string | null
          privacy_accepted_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          phone?: string | null
          document_number?: string | null
          birth_date?: string | null
          bio?: string | null
          website_url?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          social_tiktok?: string | null
          social_linkedin?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          affiliate_code?: string | null
          referral_code?: string | null
          referred_by?: string | null
          total_commissions?: number
          total_clicks?: number
          total_conversions?: number
          conversion_rate?: number
          last_activity_at?: string | null
          onboarding_completed_at?: string | null
          terms_accepted_at?: string | null
          privacy_accepted_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          phone?: string | null
          document_number?: string | null
          birth_date?: string | null
          bio?: string | null
          website_url?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          social_tiktok?: string | null
          social_linkedin?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          affiliate_code?: string | null
          referral_code?: string | null
          referred_by?: string | null
          total_commissions?: number
          total_clicks?: number
          total_conversions?: number
          conversion_rate?: number
          last_activity_at?: string | null
          onboarding_completed_at?: string | null
          terms_accepted_at?: string | null
          privacy_accepted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'commission' | 'payment' | 'product' | 'system' | 'achievement'
          title: string
          message: string
          action_url: string | null
          action_label: string | null
          is_read: boolean
          is_sent_email: boolean
          is_sent_push: boolean
          priority: number
          metadata: Json | null
          expires_at: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'commission' | 'payment' | 'product' | 'system' | 'achievement'
          title: string
          message: string
          action_url?: string | null
          action_label?: string | null
          is_read?: boolean
          is_sent_email?: boolean
          is_sent_push?: boolean
          priority?: number
          metadata?: Json | null
          expires_at?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'commission' | 'payment' | 'product' | 'system' | 'achievement'
          title?: string
          message?: string
          action_url?: string | null
          action_label?: string | null
          is_read?: boolean
          is_sent_email?: boolean
          is_sent_push?: boolean
          priority?: number
          metadata?: Json | null
          expires_at?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      link_analytics: {
        Row: {
          id: string
          link_id: string
          user_id: string
          event_type: 'click' | 'view' | 'conversion' | 'signup' | 'purchase'
          ip_address: string | null
          user_agent: string | null
          referer_url: string | null
          country_code: string | null
          region: string | null
          city: string | null
          device_type: string | null
          browser: string | null
          operating_system: string | null
          session_id: string | null
          conversion_value: number | null
          commission_earned: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          link_id: string
          user_id: string
          event_type: 'click' | 'view' | 'conversion' | 'signup' | 'purchase'
          ip_address?: string | null
          user_agent?: string | null
          referer_url?: string | null
          country_code?: string | null
          region?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          operating_system?: string | null
          session_id?: string | null
          conversion_value?: number | null
          commission_earned?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          user_id?: string
          event_type?: 'click' | 'view' | 'conversion' | 'signup' | 'purchase'
          ip_address?: string | null
          user_agent?: string | null
          referer_url?: string | null
          country_code?: string | null
          region?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          operating_system?: string | null
          session_id?: string | null
          conversion_value?: number | null
          commission_earned?: number | null
          metadata?: Json | null
          created_at?: string
        }
      }
      creatives: {
        Row: {
          id: string
          product_id: string
          created_by: string | null
          title: string
          description: string | null
          creative_type: 'banner' | 'video' | 'text' | 'email' | 'social' | 'landing_page'
          file_url: string | null
          thumbnail_url: string | null
          dimensions: string | null
          file_size_bytes: number | null
          file_format: string | null
          duration_seconds: number | null
          color_scheme: string[] | null
          copy_text: string | null
          call_to_action: string | null
          target_audience: string | null
          performance_notes: string | null
          download_count: number
          conversion_rate: number
          is_featured: boolean
          is_exclusive: boolean
          is_active: boolean
          tags: string[] | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          created_by?: string | null
          title: string
          description?: string | null
          creative_type: 'banner' | 'video' | 'text' | 'email' | 'social' | 'landing_page'
          file_url?: string | null
          thumbnail_url?: string | null
          dimensions?: string | null
          file_size_bytes?: number | null
          file_format?: string | null
          duration_seconds?: number | null
          color_scheme?: string[] | null
          copy_text?: string | null
          call_to_action?: string | null
          target_audience?: string | null
          performance_notes?: string | null
          download_count?: number
          conversion_rate?: number
          is_featured?: boolean
          is_exclusive?: boolean
          is_active?: boolean
          tags?: string[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          creative_type?: 'banner' | 'video' | 'text' | 'email' | 'social' | 'landing_page'
          file_url?: string | null
          thumbnail_url?: string | null
          dimensions?: string | null
          file_size_bytes?: number | null
          file_format?: string | null
          duration_seconds?: number | null
          color_scheme?: string[] | null
          copy_text?: string | null
          call_to_action?: string | null
          target_audience?: string | null
          performance_notes?: string | null
          download_count?: number
          conversion_rate?: number
          is_featured?: boolean
          is_exclusive?: boolean
          is_active?: boolean
          tags?: string[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_link_click: {
        Args: {
          p_link_id: string
          p_ip_address?: string
          p_user_agent?: string
          p_referer_url?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_conversion: {
        Args: {
          p_link_id: string
          p_order_id: string
          p_customer_email: string
          p_gross_amount: number
          p_commission_rate: number
          p_metadata?: Json
        }
        Returns: string
      }
      generate_performance_report: {
        Args: {
          p_user_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          total_clicks: number
          unique_clicks: number
          total_conversions: number
          total_commissions: number
          conversion_rate: number
          avg_commission_value: number
          top_products: Json
        }[]
      }
    }
    Enums: {
      analytics_event_type: 'click' | 'view' | 'conversion' | 'signup' | 'purchase'
      commission_status: 'pending' | 'approved' | 'paid' | 'cancelled' | 'disputed'
      creative_type: 'banner' | 'video' | 'text' | 'email' | 'social' | 'landing_page'
      link_status: 'active' | 'inactive' | 'expired'
      notification_type: 'commission' | 'payment' | 'product' | 'system' | 'achievement'
      payment_method: 'pix' | 'bank_transfer' | 'paypal' | 'crypto'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
      product_status: 'active' | 'inactive' | 'pending' | 'archived'
      user_status: 'active' | 'inactive' | 'pending' | 'suspended'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
