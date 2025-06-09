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
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_members: number | null
          name: string
          settings: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name: string
          settings?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name?: string
          settings?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string | null
          amount: number
          conversion_data: Json | null
          created_at: string | null
          external_transaction_id: string | null
          id: string
          offer_id: string | null
          paid_at: string | null
          product_id: string | null
          raw_payload: Json | null
          status: Database["public"]["Enums"]["commission_status"] | null
          updated_at: string | null
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          conversion_data?: Json | null
          created_at?: string | null
          external_transaction_id?: string | null
          id?: string
          offer_id?: string | null
          paid_at?: string | null
          product_id?: string | null
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["commission_status"] | null
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          conversion_data?: Json | null
          created_at?: string | null
          external_transaction_id?: string | null
          id?: string
          offer_id?: string | null
          paid_at?: string | null
          product_id?: string | null
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["commission_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "product_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          performance_rating: number | null
          platform: string | null
          product_id: string | null
          title: string
          type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          performance_rating?: number | null
          platform?: string | null
          product_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          performance_rating?: number | null
          platform?: string | null
          product_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          duration_total: number | null
          enrollment_count: number | null
          id: string
          instructor_id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_free: boolean | null
          lessons_count: number | null
          price: number | null
          published_at: string | null
          rating_average: number | null
          rating_count: number | null
          skill_level: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_total?: number | null
          enrollment_count?: number | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          lessons_count?: number | null
          price?: number | null
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          skill_level?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_total?: number | null
          enrollment_count?: number | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          lessons_count?: number | null
          price?: number | null
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          skill_level?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_downloads: {
        Row: {
          affiliate_id: string | null
          creative_id: string | null
          downloaded_at: string | null
          id: string
        }
        Insert: {
          affiliate_id?: string | null
          creative_id?: string | null
          downloaded_at?: string | null
          id?: string
        }
        Update: {
          affiliate_id?: string | null
          creative_id?: string | null
          downloaded_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_downloads_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_downloads_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      creatives: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          dimensions: string | null
          download_count: number | null
          external_link: string | null
          file_size: number | null
          file_upload_id: string | null
          file_url: string | null
          format: string | null
          id: string
          is_active: boolean | null
          license_type: string | null
          preview_url: string | null
          product_id: string | null
          rejection_reason: string | null
          title: string
          type: string
          updated_at: string | null
          usage_instructions: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          download_count?: number | null
          external_link?: string | null
          file_size?: number | null
          file_upload_id?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          license_type?: string | null
          preview_url?: string | null
          product_id?: string | null
          rejection_reason?: string | null
          title: string
          type: string
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          download_count?: number | null
          external_link?: string | null
          file_size?: number | null
          file_upload_id?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          license_type?: string | null
          preview_url?: string | null
          product_id?: string | null
          rejection_reason?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_file_upload_id_fkey"
            columns: ["file_upload_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_name: string
          id: string
          ip_address: unknown | null
          referrer: string | null
          session_id: string | null
          source: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      elite_tips: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elite_tips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elite_tips_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_integrations: {
        Row: {
          config: Json
          created_at: string | null
          error_message: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          service_name: string
          sync_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          service_name: string
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          service_name?: string
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          bucket_name: string | null
          created_at: string | null
          external_url: string | null
          file_hash: string | null
          file_path: string
          file_size: number
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string
          original_filename: string
          processing_status: string | null
          stored_filename: string
          thumbnail_path: string | null
          updated_at: string | null
          upload_source: string | null
          user_id: string | null
          virus_scan_status: string | null
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string | null
          external_url?: string | null
          file_hash?: string | null
          file_path: string
          file_size: number
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type: string
          original_filename: string
          processing_status?: string | null
          stored_filename: string
          thumbnail_path?: string | null
          updated_at?: string | null
          upload_source?: string | null
          user_id?: string | null
          virus_scan_status?: string | null
        }
        Update: {
          bucket_name?: string | null
          created_at?: string | null
          external_url?: string | null
          file_hash?: string | null
          file_path?: string
          file_size?: number
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string
          original_filename?: string
          processing_status?: string | null
          stored_filename?: string
          thumbnail_path?: string | null
          updated_at?: string | null
          upload_source?: string | null
          user_id?: string | null
          virus_scan_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string | null
          updated_at: string | null
          user_id: string | null
          watch_time: number | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time?: number | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_preview: boolean | null
          order_index: number | null
          quiz_data: Json | null
          resources_url: string | null
          title: string
          updated_at: string | null
          video_duration: number | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_preview?: boolean | null
          order_index?: number | null
          quiz_data?: Json | null
          resources_url?: string | null
          title: string
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_preview?: boolean | null
          order_index?: number | null
          quiz_data?: Json | null
          resources_url?: string | null
          title?: string
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          course_id: string | null
          created_at: string | null
          download_count: number | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_downloadable: boolean | null
          lesson_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_downloadable?: boolean | null
          lesson_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_downloadable?: boolean | null
          lesson_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          file_upload_id: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          message_type: string | null
          metadata: Json | null
          reply_to_id: string | null
          room_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_upload_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_upload_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_file_upload_id_fkey"
            columns: ["file_upload_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
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
          },
        ]
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string | null
          delivery_channels: string[] | null
          delivery_status: Json | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          delivery_channels?: string[] | null
          delivery_status?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          delivery_channels?: string[] | null
          delivery_status?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_offers: {
        Row: {
          commission_amount: number | null
          commission_rate: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          metadata: Json | null
          name: string
          original_price: number | null
          price: number
          product_id: string
          promotion_url: string | null
          sort_order: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          commission_amount?: number | null
          commission_rate: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          metadata?: Json | null
          name: string
          original_price?: number | null
          price: number
          product_id: string
          promotion_url?: string | null
          sort_order?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          metadata?: Json | null
          name?: string
          original_price?: number | null
          price?: number
          product_id?: string
          promotion_url?: string | null
          sort_order?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          commission_amount: number | null
          commission_rate: number
          conversion_rate_avg: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          earnings_per_click: number | null
          gravity_score: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          min_payout: number | null
          name: string
          original_price: number | null
          price: number
          refund_rate: number | null
          requires_approval: boolean | null
          sales_page_url: string
          short_description: string | null
          slug: string | null
          status: string | null
          thumbnail_url: string | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          commission_amount?: number | null
          commission_rate?: number
          conversion_rate_avg?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          earnings_per_click?: number | null
          gravity_score?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          min_payout?: number | null
          name: string
          original_price?: number | null
          price: number
          refund_rate?: number | null
          requires_approval?: boolean | null
          sales_page_url: string
          short_description?: string | null
          slug?: string | null
          status?: string | null
          thumbnail_url?: string | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          commission_amount?: number | null
          commission_rate?: number
          conversion_rate_avg?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          earnings_per_click?: number | null
          gravity_score?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          min_payout?: number | null
          name?: string
          original_price?: number | null
          price?: number
          refund_rate?: number | null
          requires_approval?: boolean | null
          sales_page_url?: string
          short_description?: string | null
          slug?: string | null
          status?: string | null
          thumbnail_url?: string | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          affiliate_code: string | null
          affiliate_id: string | null
          affiliate_status:
            | Database["public"]["Enums"]["affiliate_status"]
            | null
          approved_at: string | null
          avatar_url: string | null
          bio: string | null
          commission_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          date_of_birth: string | null
          document_number: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          last_activity_at: string | null
          last_login_at: string | null
          last_name: string | null
          login_count: number | null
          notification_settings: Json | null
          onboarding_completed_at: string | null
          permissions: Json | null
          phone: string | null
          preferences: Json | null
          privacy_settings: Json | null
          referral_code: string | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          social_media: Json | null
          total_clicks: number | null
          total_conversions: number | null
          total_earnings: number | null
          updated_at: string | null
          username: string | null
          verification_token: string | null
        }
        Insert: {
          address?: Json | null
          affiliate_code?: string | null
          affiliate_id?: string | null
          affiliate_status?:
            | Database["public"]["Enums"]["affiliate_status"]
            | null
          approved_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          login_count?: number | null
          notification_settings?: Json | null
          onboarding_completed_at?: string | null
          permissions?: Json | null
          phone?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          referral_code?: string | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_media?: Json | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          username?: string | null
          verification_token?: string | null
        }
        Update: {
          address?: Json | null
          affiliate_code?: string | null
          affiliate_id?: string | null
          affiliate_status?:
            | Database["public"]["Enums"]["affiliate_status"]
            | null
          approved_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          login_count?: number | null
          notification_settings?: Json | null
          onboarding_completed_at?: string | null
          permissions?: Json | null
          phone?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          referral_code?: string | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_media?: Json | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          username?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_events: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempts: number | null
          created_at: string | null
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          delivered_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          secret_key: string | null
          success_count: number | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          secret_key?: string | null
          success_count?: number | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          secret_key?: string | null
          success_count?: number | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_chat_rooms: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_affiliate_stats: {
        Args: {
          affiliate_uuid: string
        }
        Returns: Json
      }
      get_earnings_summary: {
        Args: {
          affiliate_uuid: string
        }
        Returns: {
          total_pending: number
          total_approved: number
          total_paid: number
          this_month: number
          last_month: number
        }[]
      }
      get_product_default_offer: {
        Args: {
          product_uuid: string
        }
        Returns: {
          commission_amount: number | null
          commission_rate: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          metadata: Json | null
          name: string
          original_price: number | null
          price: number
          product_id: string
          promotion_url: string | null
          sort_order: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
      }
      get_user_dashboard_data: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_commissions: number
          monthly_commissions: number
          total_clicks: number
          conversion_rate: number
          pending_commissions: number
          paid_commissions: number
          products_count: number
          top_product: Json
        }[]
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      promote_user_role: {
        Args: {
          user_email: string
          new_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      update_all_affiliate_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      affiliate_status: "pending" | "approved" | "rejected" | "suspended"
      commission_status: "pending" | "approved" | "paid" | "cancelled"
      event_type: "click" | "conversion" | "commission_earned" | "payment_sent"
      notification_type: "info" | "success" | "warning" | "error"
      payment_method: "pix" | "bank_transfer" | "paypal"
      payment_status: "pending" | "processing" | "completed" | "failed"
      product_status: "active" | "inactive" | "pending" | "archived"
      user_role: "user" | "affiliate" | "moderator" | "admin" | "super_admin"
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
    Enums: {
      affiliate_status: ["pending", "approved", "rejected", "suspended"],
      commission_status: ["pending", "approved", "paid", "cancelled"],
      event_type: ["click", "conversion", "commission_earned", "payment_sent"],
      notification_type: ["info", "success", "warning", "error"],
      payment_method: ["pix", "bank_transfer", "paypal"],
      payment_status: ["pending", "processing", "completed", "failed"],
      product_status: ["active", "inactive", "pending", "archived"],
      user_role: ["user", "affiliate", "moderator", "admin", "super_admin"],
    },
  },
} as const
