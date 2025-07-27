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
  if (!user || !event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Auth or body missing' }) };
  }

  const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { front, back }: { front: string; back: string; } = JSON.parse(event.body);

  const { data, error } = await supabase
    .from('cards')
    .insert([{ front, back, user_id: user.sub, category: 'MY CARDS' }])
    .select()
    .single();

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { statusCode: 201, body: JSON.stringify(data) };
};

export { handler };
