import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

// Define the database types for consistency and to prevent future type issues.
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
