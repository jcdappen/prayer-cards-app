import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

// Define the database types to fix type inference issues with Supabase client.
interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          front: string;
          back: string;
          category: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          front: string;
          back: string;
          category: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          front?: string;
          back?: string;
          category?: string;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}

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
