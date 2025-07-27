
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
    if (!user || !event.body) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Auth or body missing' }) };
    }

    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const { cardId }: { cardId: string; } = JSON.parse(event.body);
    
    if (!cardId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Card ID is required' }) };
    }

    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.sub);

    if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 204, body: '' };
};

export { handler };
