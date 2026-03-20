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
      leads: {
        Row: {
          accredited: boolean | null
          address: Json | null
          appointment_date: string | null
          companies: Json | null
          created_at: string
          donations: string[] | null
          education: Json | null
          emails: Json | null
          enrichment_method: string | null
          enrichment_status:
            | Database["public"]["Enums"]["enrichment_status"]
            | null
          financial: Json | null
          home: Json | null
          household: Json | null
          id: string
          identity: Json | null
          interests: string[] | null
          investment_range: string | null
          investments: Json | null
          lead_email: string | null
          lead_name: string
          lead_phone: string | null
          phones: Json | null
          qualification_score: number | null
          qualification_tier:
            | Database["public"]["Enums"]["qualification_tier"]
            | null
          reading: string[] | null
          routing_destination:
            | Database["public"]["Enums"]["routing_destination"]
            | null
          showed_up: boolean | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          vehicles: Json | null
        }
        Insert: {
          accredited?: boolean | null
          address?: Json | null
          appointment_date?: string | null
          companies?: Json | null
          created_at?: string
          donations?: string[] | null
          education?: Json | null
          emails?: Json | null
          enrichment_method?: string | null
          enrichment_status?:
            | Database["public"]["Enums"]["enrichment_status"]
            | null
          financial?: Json | null
          home?: Json | null
          household?: Json | null
          id?: string
          identity?: Json | null
          interests?: string[] | null
          investment_range?: string | null
          investments?: Json | null
          lead_email?: string | null
          lead_name: string
          lead_phone?: string | null
          phones?: Json | null
          qualification_score?: number | null
          qualification_tier?:
            | Database["public"]["Enums"]["qualification_tier"]
            | null
          reading?: string[] | null
          routing_destination?:
            | Database["public"]["Enums"]["routing_destination"]
            | null
          showed_up?: boolean | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          vehicles?: Json | null
        }
        Update: {
          accredited?: boolean | null
          address?: Json | null
          appointment_date?: string | null
          companies?: Json | null
          created_at?: string
          donations?: string[] | null
          education?: Json | null
          emails?: Json | null
          enrichment_method?: string | null
          enrichment_status?:
            | Database["public"]["Enums"]["enrichment_status"]
            | null
          financial?: Json | null
          home?: Json | null
          household?: Json | null
          id?: string
          identity?: Json | null
          interests?: string[] | null
          investment_range?: string | null
          investments?: Json | null
          lead_email?: string | null
          lead_name?: string
          lead_phone?: string | null
          phones?: Json | null
          qualification_score?: number | null
          qualification_tier?:
            | Database["public"]["Enums"]["qualification_tier"]
            | null
          reading?: string[] | null
          routing_destination?:
            | Database["public"]["Enums"]["routing_destination"]
            | null
          showed_up?: boolean | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          vehicles?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      enrichment_status: "verified" | "spouse" | "no-match" | "pending"
      lead_status:
        | "new"
        | "booked"
        | "qualified"
        | "non-accredited"
        | "abandoned"
      qualification_tier: "qualified" | "borderline" | "unqualified"
      routing_destination: "closer" | "setter" | "downsell"
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
      enrichment_status: ["verified", "spouse", "no-match", "pending"],
      lead_status: [
        "new",
        "booked",
        "qualified",
        "non-accredited",
        "abandoned",
      ],
      qualification_tier: ["qualified", "borderline", "unqualified"],
      routing_destination: ["closer", "setter", "downsell"],
    },
  },
} as const
