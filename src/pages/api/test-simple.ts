import type { APIContext } from "astro";

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Endpoint de prueba funcionando",
        receivedData: body
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en endpoint de prueba:", error);

    return new Response(
      JSON.stringify({ error: "Error en endpoint de prueba" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 