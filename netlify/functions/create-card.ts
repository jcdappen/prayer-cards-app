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
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Check for Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      statusCode: 401, 
      headers,
      body: JSON.stringify({ error: 'Missing or invalid authorization header' }) 
    };
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!event.body) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: 'Request body missing' }) 
    };
  }

  // Initialize Supabase client
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ error: 'Invalid token or user not found' }) 
      };
    }

    // Parse request body
    const { front, back }: { front: string; back: string; } = JSON.parse(event.body);

    // Insert new card
    const { data, error } = await supabase
      .from('cards')
      .insert([{ front, back, user_id: user.id, category: 'MY CARDS' }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ error: error.message }) 
      };
    }

    return { 
      statusCode: 201, 
      headers,
      body: JSON.stringify(data) 
    };

  } catch (error) {
    console.error('Function error:', error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Internal server error' }) 
    };
  }
};

export { handler };