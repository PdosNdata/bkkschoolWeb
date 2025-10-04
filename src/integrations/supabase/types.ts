export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          author_name: string
          content: string
          cover_image: string | null
          cover_image_index: number | null
          created_at: string
          id: string
          images: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          content: string
          cover_image?: string | null
          cover_image_index?: number | null
          created_at?: string
          id?: string
          images?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          content?: string
          cover_image?: string | null
          cover_image_index?: number | null
          created_at?: string
          id?: string
          images?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admission_applications: {
        Row: {
          address: string
          birth_date: string
          created_at: string
          gpa: string | null
          grade: string
          id: string
          parent_email: string
          parent_name: string
          parent_phone: string
          previous_school: string
          special_needs: string | null
          student_id: string
          student_name: string
          updated_at: string
        }
        Insert: {
          address: string
          birth_date: string
          created_at?: string
          gpa?: string | null
          grade: string
          id?: string
          parent_email: string
          parent_name: string
          parent_phone: string
          previous_school: string
          special_needs?: string | null
          student_id: string
          student_name: string
          updated_at?: string
        }
        Update: {
          address?: string
          birth_date?: string
          created_at?: string
          gpa?: string | null
          grade?: string
          id?: string
          parent_email?: string
          parent_name?: string
          parent_phone?: string
          previous_school?: string
          special_needs?: string | null
          student_id?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admission_applications_audit: {
        Row: {
          action: string
          application_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          performed_at: string | null
          performed_by: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          application_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          application_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admission_applications_audit_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "admission_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_sensitive_data: {
        Row: {
          application_id: string
          created_at: string
          encrypted_address: string | null
          encrypted_birth_date: string | null
          encrypted_parent_email: string | null
          encrypted_parent_name: string | null
          encrypted_parent_phone: string | null
          encrypted_student_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          encrypted_address?: string | null
          encrypted_birth_date?: string | null
          encrypted_parent_email?: string | null
          encrypted_parent_name?: string | null
          encrypted_parent_phone?: string | null
          encrypted_student_name?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          encrypted_address?: string | null
          encrypted_birth_date?: string | null
          encrypted_parent_email?: string | null
          encrypted_parent_name?: string | null
          encrypted_parent_phone?: string | null
          encrypted_student_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_sensitive_data_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "admission_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      media_resources: {
        Row: {
          author_name: string
          created_at: string
          description: string
          id: string
          media_type: string
          media_url: string
          published_date: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name: string
          created_at?: string
          description: string
          id?: string
          media_type: string
          media_url: string
          published_date?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          created_at?: string
          description?: string
          id?: string
          media_type?: string
          media_url?: string
          published_date?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_name: string
          category: string
          content: string
          cover_image: string | null
          created_at: string
          id: string
          published_date: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name: string
          category?: string
          content: string
          cover_image?: string | null
          created_at?: string
          id?: string
          published_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          published_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      personnel: {
        Row: {
          additional_details: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          photo_url: string | null
          position: string | null
          subject_group: string | null
          updated_at: string
        }
        Insert: {
          additional_details?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          subject_group?: string | null
          updated_at?: string
        }
        Update: {
          additional_details?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          subject_group?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sensitive_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          application_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          application_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          application_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      submission_rate_limit: {
        Row: {
          blocked_until: string | null
          email: string
          first_submission_at: string | null
          id: string
          ip_address: unknown
          is_blocked: boolean | null
          last_submission_at: string | null
          submission_count: number | null
        }
        Insert: {
          blocked_until?: string | null
          email: string
          first_submission_at?: string | null
          id?: string
          ip_address: unknown
          is_blocked?: boolean | null
          last_submission_at?: string | null
          submission_count?: number | null
        }
        Update: {
          blocked_until?: string | null
          email?: string
          first_submission_at?: string | null
          id?: string
          ip_address?: unknown
          is_blocked?: boolean | null
          last_submission_at?: string | null
          submission_count?: number | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          granted: boolean
          id: string
          permission_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted?: boolean
          id?: string
          permission_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          id?: string
          permission_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved: boolean
          created_at: string
          email: string | null
          id: string
          pending_approval: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email?: string | null
          id?: string
          pending_approval?: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string | null
          id?: string
          pending_approval?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_submission_rate_limit: {
        Args: { p_email: string; p_ip_address: unknown }
        Returns: boolean
      }
      decrypt_sensitive_field: {
        Args: { encrypted_data: string; secret_key?: string }
        Returns: string
      }
      encrypt_sensitive_field: {
        Args: { data: string; secret_key?: string }
        Returns: string
      }
      get_admission_applications_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          birth_date: string
          created_at: string
          gpa: string
          grade: string
          id: string
          parent_email: string
          parent_name: string
          parent_phone: string
          previous_school: string
          special_needs: string
          student_id: string
          student_name: string
          updated_at: string
        }[]
      }
      get_admission_applications_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          birth_date: string
          created_at: string
          gpa: string
          grade: string
          id: string
          parent_email: string
          parent_name: string
          parent_phone: string
          previous_school: string
          special_needs: string
          student_id: string
          student_name: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_sensitive_access: {
        Args: { access_type: string; app_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "teacher" | "student" | "guardian" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["teacher", "student", "guardian", "admin"],
    },
  },
} as const
