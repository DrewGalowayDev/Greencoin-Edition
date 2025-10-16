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
      alerts: {
        Row: {
          action_required: boolean
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          crop_id: string | null
          expires_at: string | null
          farm_id: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["alert_priority"]
          title: string
          user_id: string
        }
        Insert: {
          action_required?: boolean
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          crop_id?: string | null
          expires_at?: string | null
          farm_id?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["alert_priority"]
          title: string
          user_id: string
        }
        Update: {
          action_required?: boolean
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          crop_id?: string | null
          expires_at?: string | null
          farm_id?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["alert_priority"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          created_at: string
          credit_id: string
          credits_amount: number
          farm_id: string
          greencoins_amount: number
          id: string
          status: string
          transaction_date: string
          transaction_type: string
          verifier: string
        }
        Insert: {
          created_at?: string
          credit_id: string
          credits_amount: number
          farm_id: string
          greencoins_amount: number
          id?: string
          status?: string
          transaction_date: string
          transaction_type?: string
          verifier: string
        }
        Update: {
          created_at?: string
          credit_id?: string
          credits_amount?: number
          farm_id?: string
          greencoins_amount?: number
          id?: string
          status?: string
          transaction_date?: string
          transaction_type?: string
          verifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          co2_tons: number
          created_at: string
          estimated_value: number
          farm_id: string
          greencoins: number
          id: string
          updated_at: string
          verification_body: string | null
          verification_progress: number
          verification_status: string
        }
        Insert: {
          co2_tons?: number
          created_at?: string
          estimated_value?: number
          farm_id: string
          greencoins?: number
          id?: string
          updated_at?: string
          verification_body?: string | null
          verification_progress?: number
          verification_status?: string
        }
        Update: {
          co2_tons?: number
          created_at?: string
          estimated_value?: number
          farm_id?: string
          greencoins?: number
          id?: string
          updated_at?: string
          verification_body?: string | null
          verification_progress?: number
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_history: {
        Row: {
          change_type: string
          changed_by: string
          created_at: string
          crop_id: string
          id: string
          new_values: Json | null
          notes: string | null
          old_values: Json | null
        }
        Insert: {
          change_type: string
          changed_by: string
          created_at?: string
          crop_id: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
        }
        Update: {
          change_type?: string
          changed_by?: string
          created_at?: string
          crop_id?: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "crop_history_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          actual_harvest_date: string | null
          actual_yield_kg: number | null
          created_at: string
          crop_type: string
          current_stage: Database["public"]["Enums"]["crop_stage"]
          expected_harvest_date: string | null
          expected_yield_kg: number | null
          farm_id: string
          health_status: Database["public"]["Enums"]["crop_health"]
          id: string
          image_urls: string[] | null
          notes: string | null
          planted_area_hectares: number
          planting_date: string
          updated_at: string
          variety: string | null
        }
        Insert: {
          actual_harvest_date?: string | null
          actual_yield_kg?: number | null
          created_at?: string
          crop_type: string
          current_stage?: Database["public"]["Enums"]["crop_stage"]
          expected_harvest_date?: string | null
          expected_yield_kg?: number | null
          farm_id: string
          health_status?: Database["public"]["Enums"]["crop_health"]
          id?: string
          image_urls?: string[] | null
          notes?: string | null
          planted_area_hectares: number
          planting_date: string
          updated_at?: string
          variety?: string | null
        }
        Update: {
          actual_harvest_date?: string | null
          actual_yield_kg?: number | null
          created_at?: string
          crop_type?: string
          current_stage?: Database["public"]["Enums"]["crop_stage"]
          expected_harvest_date?: string | null
          expected_yield_kg?: number | null
          farm_id?: string
          health_status?: Database["public"]["Enums"]["crop_health"]
          id?: string
          image_urls?: string[] | null
          notes?: string | null
          planted_area_hectares?: number
          planting_date?: string
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_inventory: {
        Row: {
          category: string
          created_at: string
          current_condition: Database["public"]["Enums"]["equipment_condition"]
          farm_id: string
          id: string
          image_urls: string[] | null
          item_name: string
          last_maintenance_date: string | null
          location_in_farm: string | null
          maintenance_schedule: string | null
          next_maintenance_date: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          quantity: number
          supplier_info: Json | null
          unit: string | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          category: string
          created_at?: string
          current_condition?: Database["public"]["Enums"]["equipment_condition"]
          farm_id: string
          id?: string
          image_urls?: string[] | null
          item_name: string
          last_maintenance_date?: string | null
          location_in_farm?: string | null
          maintenance_schedule?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          supplier_info?: Json | null
          unit?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          current_condition?: Database["public"]["Enums"]["equipment_condition"]
          farm_id?: string
          id?: string
          image_urls?: string[] | null
          item_name?: string
          last_maintenance_date?: string | null
          location_in_farm?: string | null
          maintenance_schedule?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number
          supplier_info?: Json | null
          unit?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_inventory_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_activities: {
        Row: {
          activity_date: string
          activity_type: string
          cost: number | null
          created_at: string
          crop_id: string | null
          description: string | null
          duration_hours: number | null
          farm_id: string
          id: string
          notes: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_date: string
          activity_type: string
          cost?: number | null
          created_at?: string
          crop_id?: string | null
          description?: string | null
          duration_hours?: number | null
          farm_id: string
          id?: string
          notes?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          cost?: number | null
          created_at?: string
          crop_id?: string | null
          description?: string | null
          duration_hours?: number | null
          farm_id?: string
          id?: string
          notes?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_activities_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_activities_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      farms: {
        Row: {
          climate_zone: string | null
          created_at: string
          description: string | null
          established_date: string | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          owner_id: string
          practices: string[] | null
          size_hectares: number
          soil_type: string | null
          status: Database["public"]["Enums"]["farm_status"]
          updated_at: string
        }
        Insert: {
          climate_zone?: string | null
          created_at?: string
          description?: string | null
          established_date?: string | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          owner_id: string
          practices?: string[] | null
          size_hectares: number
          soil_type?: string | null
          status?: Database["public"]["Enums"]["farm_status"]
          updated_at?: string
        }
        Update: {
          climate_zone?: string | null
          created_at?: string
          description?: string | null
          established_date?: string | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          owner_id?: string
          practices?: string[] | null
          size_hectares?: number
          soil_type?: string | null
          status?: Database["public"]["Enums"]["farm_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string
          crop_id: string | null
          currency: string
          description: string
          farm_id: string
          id: string
          receipt_url: string | null
          supplier_info: Json | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at?: string
          crop_id?: string | null
          currency?: string
          description: string
          farm_id: string
          id?: string
          receipt_url?: string | null
          supplier_info?: Json | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"]
          created_at?: string
          crop_id?: string | null
          currency?: string
          description?: string
          farm_id?: string
          id?: string
          receipt_url?: string | null
          supplier_info?: Json | null
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          created_at: string
          crop_type: string
          currency: string
          current_price: number
          id: string
          market_demand: string | null
          price_date: string
          price_trend: string | null
          region: string
          seasonal_factor: number | null
          source: string | null
          unit: string
          variety: string | null
        }
        Insert: {
          created_at?: string
          crop_type: string
          currency?: string
          current_price: number
          id?: string
          market_demand?: string | null
          price_date: string
          price_trend?: string | null
          region: string
          seasonal_factor?: number | null
          source?: string | null
          unit?: string
          variety?: string | null
        }
        Update: {
          created_at?: string
          crop_type?: string
          currency?: string
          current_price?: number
          id?: string
          market_demand?: string | null
          price_date?: string
          price_trend?: string | null
          region?: string
          seasonal_factor?: number | null
          source?: string | null
          unit?: string
          variety?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_verified: boolean
          location: string | null
          phone: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_verified?: boolean
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_verified?: boolean
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          content_type: string | null
          created_at: string
          farm_id: string
          file_path: string | null
          file_size: number | null
          filename: string
          id: string
          uploaded_at: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          farm_id: string
          file_path?: string | null
          file_size?: number | null
          filename: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          farm_id?: string
          file_path?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_steps: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          label: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          label: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          label?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_steps_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_timeline: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          label: string
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          label: string
          status: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          label?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_timeline_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          created_at: string
          farm_id: string
          humidity_percent: number | null
          id: string
          pressure_hpa: number | null
          rainfall_mm: number | null
          recorded_at: string
          soil_moisture_percent: number | null
          temperature_celsius: number | null
          uv_index: number | null
          weather_description: string | null
          wind_speed_kmh: number | null
        }
        Insert: {
          created_at?: string
          farm_id: string
          humidity_percent?: number | null
          id?: string
          pressure_hpa?: number | null
          rainfall_mm?: number | null
          recorded_at?: string
          soil_moisture_percent?: number | null
          temperature_celsius?: number | null
          uv_index?: number | null
          weather_description?: string | null
          wind_speed_kmh?: number | null
        }
        Update: {
          created_at?: string
          farm_id?: string
          humidity_percent?: number | null
          id?: string
          pressure_hpa?: number | null
          rainfall_mm?: number | null
          recorded_at?: string
          soil_moisture_percent?: number | null
          temperature_celsius?: number | null
          uv_index?: number | null
          weather_description?: string | null
          wind_speed_kmh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
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
      alert_priority: "low" | "medium" | "high" | "critical"
      alert_type:
        | "weather"
        | "crop_health"
        | "financial"
        | "maintenance"
        | "harvest"
      app_role: "admin" | "farmer" | "moderator"
      crop_health: "excellent" | "good" | "fair" | "poor" | "diseased"
      crop_stage:
        | "planted"
        | "growing"
        | "flowering"
        | "harvesting"
        | "harvested"
      equipment_condition:
        | "excellent"
        | "good"
        | "fair"
        | "poor"
        | "needs_repair"
      farm_status: "active" | "inactive" | "seasonal"
      transaction_category:
        | "seeds"
        | "fertilizer"
        | "equipment"
        | "labor"
        | "fuel"
        | "maintenance"
        | "sales"
        | "other"
      transaction_type: "income" | "expense"
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
      alert_priority: ["low", "medium", "high", "critical"],
      alert_type: [
        "weather",
        "crop_health",
        "financial",
        "maintenance",
        "harvest",
      ],
      app_role: ["admin", "farmer", "moderator"],
      crop_health: ["excellent", "good", "fair", "poor", "diseased"],
      crop_stage: [
        "planted",
        "growing",
        "flowering",
        "harvesting",
        "harvested",
      ],
      equipment_condition: [
        "excellent",
        "good",
        "fair",
        "poor",
        "needs_repair",
      ],
      farm_status: ["active", "inactive", "seasonal"],
      transaction_category: [
        "seeds",
        "fertilizer",
        "equipment",
        "labor",
        "fuel",
        "maintenance",
        "sales",
        "other",
      ],
      transaction_type: ["income", "expense"],
    },
  },
} as const
