import type { Handler } from "@netlify/functions";
import { db, auth } from './_firebase-admin';

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '' };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || !event.body) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized or missing body' }) };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { cardId } = JSON.parse(event.body);

    if (!cardId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Card ID is required' }) };
    }
    
    const cardRef = db.collection('cards').doc(cardId);
    const doc = await cardRef.get();

    if (!doc.exists || doc.data()?.userId !== uid) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Card not found or permission denied' }) };
    }
    
    await cardRef.delete();

    return { statusCode: 204, body: '' };
  } catch (error) {
    console.error('Error deleting card:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

export { handler };