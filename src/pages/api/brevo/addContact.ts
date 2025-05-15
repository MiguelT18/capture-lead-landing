import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: '⚠️ Cuerpo inválido en la solicitud' }),
      { status: 400 }
    );
  }

  const { email, firstName = '', lastName = '' } = body;

  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email es requerido' }),
      { status: 400 }
    );
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': import.meta.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: {
          NOMBRE: firstName,
          APELLIDOS: lastName,
        },
        listIds: [2],
        updateEnabled: true,
      }),
    });

    let brevoData: any = {};
    try {
      const text = await brevoRes.text();
      brevoData = text ? JSON.parse(text) : {};
    } catch (err) {
      console.warn('⚠️ Respuesta no JSON de Brevo:', err);
    }

    if (!brevoRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Error al agregar contacto', brevoData }),
        { status: brevoRes.status }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Contacto agregado exitosamente', brevoData }),
      { status: 200 }
    );
  } catch (err) {
    console.error('🔥 Error interno del servidor:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
};
