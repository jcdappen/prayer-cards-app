import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const handler: Handler = async (event, context) => {
    const { user } = context.clientContext || {};
    if (!user || !event.body) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Auth or body missing' }) };
    }

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const { cardId, front, back }: { cardId: string; front: string; back: string; } = JSON.parse(event.body);

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
