
import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

type CardsRow = {
  back: string;
  category: string;
  created_at: string;
  front: string;
  id: string;
  user_id: string;
};
type CardsInsert = {
  back: string;
  category: string;
  created_at?: string;
  front: string;
  id?: string;
  user_id: string;
};
type CardsUpdate = {
  back?: string;
  category?: string;
  created_at?: string;
  front?: string;
  id?: string;
  user_id?: string;
};

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: CardsRow;
        Insert: CardsInsert;
        Update: CardsUpdate;
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
