import type { Handler } from "@netlify/functions";
import { db, auth } from './_firebase-admin';

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '' };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const cardsSnapshot = await db.collection('cards').where('userId', '==', uid).get();
    const cards = cardsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { statusCode: 200, body: JSON.stringify(cards) };
  } catch (error) {
    console.error('Error fetching cards:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

export { handler };