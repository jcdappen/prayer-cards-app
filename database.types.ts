
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          back: string
          category: string
          created_at: string
          front: string
          id: string
          user_id: string
        }
        Insert: {
          back: string
          category: string
          created_at?: string
          front: string
          id?: string
          user_id: string
        }
        Update: {
          back?: string
          category?: string
          created_at?: string
          front?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
