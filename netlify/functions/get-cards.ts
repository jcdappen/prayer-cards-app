
import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: {
          back: string;
          category: string;
          created_at: string;
          front: string;
          id: string;
          user_id: string;
        };
        Insert: {
          back: string;
          category: string;
          created_at?: string;
          front: string;
          id?: string;
          user_id: string;
        };
        Update: {
          back?: string;
          category?: string;
          created_at?: string;
          front?: string;
          id?: string;
          user_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};


const handler: Handler = async (event, context) => {
  const { user } = context.clientContext || {};
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
  }

  const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.sub)
    .order('created_at', { ascending: false });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { statusCode: 200, body: JSON.stringify(data || []) };
};

export { handler };
