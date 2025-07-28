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

    const { front, back } = JSON.parse(event.body);

    const newCard = {
      front,
      back,
      userId: uid,
      category: 'MY CARDS',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('cards').add(newCard);
    
    return { 
        statusCode: 201, 
        body: JSON.stringify({ id: docRef.id, ...newCard }) 
    };
  } catch (error) {
    console.error('Error creating card:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

export { handler };