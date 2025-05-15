import type { APIContext } from "astro";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST({ request }: APIContext) {
  const body = await request.json();
  const { name, lastName, email } = body;

  const fullName = `${name} ${lastName}`;

  const db = await connectToDatabase();

  const existingEmail = await db.collection("users").findOne({ email });
  if (existingEmail) {
    return new Response(
      JSON.stringify({ error: "El correo electrónico ya fue usado" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }
  
  const result = await db.collection("users").insertOne({
    name: fullName,
    email,
    opinion: ""
  });

  return new Response(
    JSON.stringify({ success: "Usuario registrado correctamente", _id: result.insertedId }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function PATCH({ request, params }: APIContext) {
  const { opinion } = await request.json();
  const userId = params.id;  // Aquí tomamos el `id` de los parámetros de la URL

  const isValidObjectId = userId ? /^[a-fA-F0-9]{24}$/.test(userId) : false;

  if (!userId || !isValidObjectId) {
    return new Response(
      JSON.stringify({ error: "ID de usuario inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const db = await connectToDatabase();

  try {
    // Convertir el `userId` a `ObjectId` para que sea compatible con MongoDB
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { opinion } }
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
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al actualizar el usuario" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}