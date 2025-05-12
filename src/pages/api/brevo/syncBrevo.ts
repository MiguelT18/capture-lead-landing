import type { APIRoute } from 'astro';
import { MongoClient } from 'mongodb';
import axios from 'axios';

const client = new MongoClient(import.meta.env.MONGODB_URI);

export const GET: APIRoute = async () => {
  try {
    await client.connect();
    const db = client.db(import.meta.env.MONGODB_DB_NAME);
    const users = await db.collection('users').find({ brevoSynced: { $ne: true } }).toArray();

    const results = [];

    
    for (const user of users) {
      try {
        const firstName = user.name.split(" ")[0];
        const lastName = user.name.split(" ").slice(1).join(" ") || "";

        const res = await axios.post(
          'https://api.brevo.com/v3/contacts',
          {
            email: user.email,
            attributes: {
              NOMBRE: firstName || '',
              APELLIDOS: lastName || '',
            },
            listIds: [2],
            updateEnabled: true,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              'api-key': import.meta.env.BREVO_API_KEY,
            },
          }
        );

        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { brevoSynced: true } }
        );

        results.push({ email: user.email, status: 'ok' });
      } catch (err: any) {
        results.push({
          email: user.email,
          status: 'error',
          error: err.response?.data || err.message,
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Sincronización completada', results }), {
      status: 200,
    });
  } catch (err) {
    console.error('Error general:', err);
    return new Response(JSON.stringify({ error: 'Error al sincronizar contactos' }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
};
