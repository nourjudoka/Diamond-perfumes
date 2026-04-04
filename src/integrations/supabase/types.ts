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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      discounts: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          min_order_amount: number | null
          name: string
          starts_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          name: string
          starts_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          name?: string
          starts_at?: string | null
        }
        Relationships: []
      }
      governorate_shipping_rules: {
        Row: {
          arrival_eta: string
          created_at: string
          governorate: string
          is_free: boolean
          shipping_fee: number
          updated_at: string
        }
        Insert: {
          arrival_eta?: string
          created_at?: string
          governorate: string
          is_free?: boolean
          shipping_fee?: number
          updated_at?: string
        }
        Update: {
          arrival_eta?: string
          created_at?: string
          governorate?: string
          is_free?: boolean
          shipping_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_brand: string
          product_id: string
          product_name: string
          quantity: number
          size: string
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_brand: string
          product_id: string
          product_name: string
          quantity?: number
          size: string
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_brand?: string
          product_id?: string
          product_name?: string
          quantity?: number
          size?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          admin_notes: string | null
          created_at: string
          customer_name: string
          discount_amount: number
          discount_code: string | null
          email: string
          id: string
          is_fake: boolean
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_screenshot: string | null
          phone: string
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          created_at?: string
          customer_name: string
          discount_amount?: number
          discount_code?: string | null
          email: string
          id?: string
          is_fake?: boolean
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_screenshot?: string | null
          phone: string
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          created_at?: string
          customer_name?: string
          discount_amount?: number
          discount_code?: string | null
          email?: string
          id?: string
          is_fake?: boolean
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_screenshot?: string | null
          phone?: string
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          created_at: string
          description: string | null
          discount_percent: number | null
          gender: string
          id: string
          image: string | null
          name: string
          notes: Json
          price: number
          scent_family: string
          sizes: string[]
          stock: number
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          gender?: string
          id?: string
          image?: string | null
          name: string
          notes?: Json
          price: number
          scent_family?: string
          sizes?: string[]
          stock?: number
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          gender?: string
          id?: string
          image?: string | null
          name?: string
          notes?: Json
          price?: number
          scent_family?: string
          sizes?: string[]
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string
          delivery_eta: string
          id: number
          shipping_fee: number
          shipping_is_free: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_eta?: string
          id?: number
          shipping_fee?: number
          shipping_is_free?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_eta?: string
          id?: number
          shipping_fee?: number
          shipping_is_free?: boolean
          updated_at?: string
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
      order_status:
        | "Pending"
        | "Confirmed"
        | "Shipped"
        | "Delivered"
        | "Cancelled"
      payment_method: "InstaPay" | "Vodafone Cash" | "Cash on Delivery"
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
      order_status: [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      payment_method: ["InstaPay", "Vodafone Cash", "Cash on Delivery"],
    },
  },
} as const
