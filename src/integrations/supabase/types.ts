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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      asset_comments: {
        Row: {
          asset_id: string
          author_name: string
          author_role: string | null
          comment: string
          created_at: string
          id: string
        }
        Insert: {
          asset_id: string
          author_name: string
          author_role?: string | null
          comment: string
          created_at?: string
          id?: string
        }
        Update: {
          asset_id?: string
          author_name?: string
          author_role?: string | null
          comment?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_comments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "client_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_configs: {
        Row: {
          id: string
          client_id: string
          name: string
          provider: string
          avatar_id: string | null
          voice_id: string | null
          style: string
          background: string
          custom_background_url: string | null
          is_default: boolean
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          provider?: string
          avatar_id?: string | null
          voice_id?: string | null
          style?: string
          background?: string
          custom_background_url?: string | null
          is_default?: boolean
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          provider?: string
          avatar_id?: string | null
          voice_id?: string | null
          style?: string
          background?: string
          custom_background_url?: string | null
          is_default?: boolean
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatar_configs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_generations: {
        Row: {
          id: string
          client_id: string
          asset_id: string | null
          schedule_id: string | null
          generation_type: string
          creative_type: string
          parent_generation_id: string | null
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          asset_id?: string | null
          schedule_id?: string | null
          generation_type: string
          creative_type: string
          parent_generation_id?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          asset_id?: string | null
          schedule_id?: string | null
          generation_type?: string
          creative_type?: string
          parent_generation_id?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_generations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_generations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "client_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_generations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "creative_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_generations_parent_generation_id_fkey"
            columns: ["parent_generation_id"]
            isOneToOne: false
            referencedRelation: "creative_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_schedules: {
        Row: {
          id: string
          client_id: string
          schedule_type: string
          frequency: string
          day_of_week: number | null
          variations_per_run: number
          enabled: boolean
          last_run_at: string | null
          next_run_at: string | null
          base_asset_id: string | null
          style_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          schedule_type?: string
          frequency?: string
          day_of_week?: number | null
          variations_per_run?: number
          enabled?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          base_asset_id?: string | null
          style_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          schedule_type?: string
          frequency?: string
          day_of_week?: number | null
          variations_per_run?: number
          enabled?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          base_asset_id?: string | null
          style_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_schedules_base_asset_id_fkey"
            columns: ["base_asset_id"]
            isOneToOne: false
            referencedRelation: "client_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_mappings: {
        Row: {
          calendar_id: string
          created_at: string
          id: string
          label: string
          route: string
          updated_at: string
        }
        Insert: {
          calendar_id: string
          created_at?: string
          id?: string
          label: string
          route: string
          updated_at?: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          id?: string
          label?: string
          route?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_assets: {
        Row: {
          angle_id: string | null
          asset_type: string
          client_id: string
          content: Json | null
          created_at: string
          id: string
          status: string
          title: string | null
          updated_at: string
          version: number
        }
        Insert: {
          angle_id?: string | null
          asset_type: string
          client_id: string
          content?: Json | null
          created_at?: string
          id?: string
          status?: string
          title?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          angle_id?: string | null
          asset_type?: string
          client_id?: string
          content?: Json | null
          created_at?: string
          id?: string
          status?: string
          title?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          additional_notes: string | null
          brand_colors: Json | null
          brand_notes: string | null
          budget_amount: string | null
          budget_mode: string | null
          card_cvv: string | null
          card_exp: string | null
          card_number: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          credibility: string | null
          current_step: number
          distribution_schedule: string | null
          ein_number: string | null
          fund_history: string | null
          fund_name: string | null
          fund_type: string | null
          hold_period: string | null
          id: string
          industry_focus: string | null
          investment_range: string | null
          investor_list_path: string | null
          kickoff_date: string | null
          kickoff_time: string | null
          logo_path: string | null
          min_investment: string | null
          pitch_deck_link: string | null
          pitch_deck_path: string | null
          primary_offer: string | null
          raise_amount: string | null
          reference_ad_paths: Json | null
          secondary_offers: Json | null
          share_token: string
          speaker_name: string | null
          status: string
          target_investor: string | null
          targeted_returns: string | null
          tax_advantages: string | null
          timeline: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          additional_notes?: string | null
          brand_colors?: Json | null
          brand_notes?: string | null
          budget_amount?: string | null
          budget_mode?: string | null
          card_cvv?: string | null
          card_exp?: string | null
          card_number?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          credibility?: string | null
          current_step?: number
          distribution_schedule?: string | null
          ein_number?: string | null
          fund_history?: string | null
          fund_name?: string | null
          fund_type?: string | null
          hold_period?: string | null
          id?: string
          industry_focus?: string | null
          investment_range?: string | null
          investor_list_path?: string | null
          kickoff_date?: string | null
          kickoff_time?: string | null
          logo_path?: string | null
          min_investment?: string | null
          pitch_deck_link?: string | null
          pitch_deck_path?: string | null
          primary_offer?: string | null
          raise_amount?: string | null
          reference_ad_paths?: Json | null
          secondary_offers?: Json | null
          share_token?: string
          speaker_name?: string | null
          status?: string
          target_investor?: string | null
          targeted_returns?: string | null
          tax_advantages?: string | null
          timeline?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          additional_notes?: string | null
          brand_colors?: Json | null
          brand_notes?: string | null
          budget_amount?: string | null
          budget_mode?: string | null
          card_cvv?: string | null
          card_exp?: string | null
          card_number?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          credibility?: string | null
          current_step?: number
          distribution_schedule?: string | null
          ein_number?: string | null
          fund_history?: string | null
          fund_name?: string | null
          fund_type?: string | null
          hold_period?: string | null
          id?: string
          industry_focus?: string | null
          investment_range?: string | null
          investor_list_path?: string | null
          kickoff_date?: string | null
          kickoff_time?: string | null
          logo_path?: string | null
          min_investment?: string | null
          pitch_deck_link?: string | null
          pitch_deck_path?: string | null
          primary_offer?: string | null
          raise_amount?: string | null
          reference_ad_paths?: Json | null
          secondary_offers?: Json | null
          share_token?: string
          speaker_name?: string | null
          status?: string
          target_investor?: string | null
          targeted_returns?: string | null
          tax_advantages?: string | null
          timeline?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          title: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          title?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
