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
          full_url: string
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
          full_url?: string
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
        Relationships: [
          {
            foreignKeyName: "affiliate_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "creatives_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          video_url: string | null
          duration_seconds: number | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          video_url?: string | null
          duration_seconds?: number | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          duration_seconds?: number | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "link_analytics_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      materials: {
        Row: {
          id: string
          lesson_id: string | null
          course_id: string | null
          title: string
          file_url: string
          file_type: string | null
          file_size: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          course_id?: string | null
          title: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          course_id?: string | null
          title?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          edited: boolean
          edited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          edited?: boolean
          edited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          edited?: boolean
          edited_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          document_number: string | null
          birth_date: string | null
          bio: string | null
          website_url: string | null
          social_instagram: string | null
          social_youtube: string | null
          social_tiktok: string | null
          social_linkedin: string | null
          role: string
          affiliate_status: string
          affiliate_id: string | null
          affiliate_code: string | null
          referral_code: string | null
          referred_by: string | null
          commission_rate: number
          total_earnings: number
          total_clicks: number
          total_conversions: number
          conversion_rate: number
          last_activity_at: string | null
          onboarding_completed_at: string | null
          terms_accepted_at: string | null
          privacy_accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          document_number?: string | null
          birth_date?: string | null
          bio?: string | null
          website_url?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          social_tiktok?: string | null
          social_linkedin?: string | null
          role?: string
          affiliate_status?: string
          affiliate_id?: string | null
          affiliate_code?: string | null
          referral_code?: string | null
          referred_by?: string | null
          commission_rate?: number
          total_earnings?: number
          total_clicks?: number
          total_conversions?: number
          conversion_rate?: number
          last_activity_at?: string | null
          onboarding_completed_at?: string | null
          terms_accepted_at?: string | null
          privacy_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          document_number?: string | null
          birth_date?: string | null
          bio?: string | null
          website_url?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          social_tiktok?: string | null
          social_linkedin?: string | null
          role?: string
          affiliate_status?: string
          affiliate_id?: string | null
          affiliate_code?: string | null
          referral_code?: string | null
          referred_by?: string | null
          commission_rate?: number
          total_earnings?: number
          total_clicks?: number
          total_conversions?: number
          conversion_rate?: number
          last_activity_at?: string | null
          onboarding_completed_at?: string | null
          terms_accepted_at?: string | null
          privacy_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      admin_dashboard_stats: {
        Row: {
          pending_affiliates: number | null
          approved_affiliates: number | null
          pending_commissions: number | null
          pending_commissions_value: number | null
          pending_payments: number | null
          pending_payments_value: number | null
          active_products: number | null
          active_courses: number | null
        }
      }
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
      product_status: 'active' | 'inactive' | 'pending' | 'archived'
      user_role: 'affiliate' | 'admin'
      affiliate_status: 'pending' | 'approved' | 'rejected' | 'suspended'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
