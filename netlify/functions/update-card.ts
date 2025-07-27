
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
          user_id: string;
          front: string;
          back: string;
          category: string;
        };
        Update: {
          front?: string;
          back?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

const handler: Handler = async (event, context) => {
    const { user } = context.clientContext || {};
    if (!user || !event.body) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Auth or body missing' }) };
    }

    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const { cardId, front, back } = JSON.parse(event.body);

    if (!cardId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Card ID is required' }) };
    }

    const { data, error } = await supabase
        .from('cards')
        .update({ front, back })
        .eq('id', cardId)
        .eq('user_id', user.sub)
        .select()
        .single();

    if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
};

export { handler };
