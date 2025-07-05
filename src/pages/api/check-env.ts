import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  try {
    const envStatus = {
      hasBrevoKey: !!import.meta.env.BREVO_API_KEY,
      hasMongoUri: !!import.meta.env.MONGODB_URI,
      hasMongoDb: !!import.meta.env.MONGODB_DB_NAME,
      brevoKeyLength: import.meta.env.BREVO_API_KEY?.length || 0,
      mongoUriLength: import.meta.env.MONGODB_URI?.length || 0,
      mongoDbLength: import.meta.env.MONGODB_DB_NAME?.length || 0,
      environment: import.meta.env.MODE || 'unknown'
    };

    return new Response(
      JSON.stringify(envStatus),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al verificar variables de entorno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 