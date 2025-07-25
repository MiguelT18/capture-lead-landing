import type { APIContext } from "astro";
import { getIp } from "@/utils/scripts";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const FORM_VERSION = "v1.0.0-prelaunch";
const LANDING_VERSION = "hero-default-prelaunch";

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json();
    const {
      name,
      lastName,
      email,
      utm = {},
      formVersion = FORM_VERSION,
      landingVersion = LANDING_VERSION,
      referrer = "",
    } = body;

    const db = await connectToDatabase();

    const existingEmail = await db.collection("users").findOne({ email });
    if (existingEmail) {
      return new Response(
        JSON.stringify({
          error: "El correo electrónico ya fue usado",
          _id: existingEmail._id
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const fullName = `${name} ${lastName}`;
    const userAgent = request.headers.get("user-agent") || "unknown";

    // const ip = await getIp().catch(() => "unknown");
    const ip = "127.0.0.1";

    const result = await db.collection("users").insertOne({
      firstName: name,
      lastName,
      name: fullName,
      email,
      opinion: "",
      createdAt: new Date(),
      telegramJoined: true,
      campaign: "pre-lanzamiento",
      sentiment: null, // será calculado luego
      status: "pre-registrado",
      utm: {
        source: utm.source || null,
        medium: utm.medium || null,
        campaign: utm.campaign || null,
        term: utm.term || null,
        content: utm.content || null,
      },
      userAgent,
      ip,
      referrer,
      formVersion,
      landingVersion,
    });

    return new Response(
      JSON.stringify({ success: "Usuario registrado correctamente", _id: result.insertedId }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en POST /api/users:", error);

    // Determinar el tipo de error para dar una respuesta más específica
    let errorMessage = "Error interno del servidor";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("MONGODB_URI") || error.message.includes("MONGODB_DB_NAME")) {
        errorMessage = "Error de configuración de base de datos";
        statusCode = 500;
      } else if (error.message.includes("connect")) {
        errorMessage = "Error de conexión a la base de datos";
        statusCode = 503;
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PATCH({ request, params }: APIContext) {
  const { opinion, sentiment = null } = await request.json();
  const userId = params.id;

  const isValidObjectId = userId ? /^[a-fA-F0-9]{24}$/.test(userId) : false;
  if (!userId || !isValidObjectId) {
    return new Response(
      JSON.stringify({ error: "ID de usuario inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const db = await connectToDatabase();

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { opinion, sentiment } }
  );

  if (result.matchedCount === 0) {
    return new Response(
      JSON.stringify({ error: "Usuario no encontrado" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: "Usuario actualizado correctamente" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
