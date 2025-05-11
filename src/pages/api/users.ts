import type { APIContext } from "astro";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST({ request }: APIContext) {
  const body = await request.json();
  const { name, email } = body;

  const db = await connectToDatabase();
  const result = await db.collection("users").insertOne({ name, email, opinion: "" });

  return new Response(JSON.stringify({ _id: result.insertedId }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH({ request, params }: APIContext) {
  const { opinion } = await request.json();
  const userId = params.id;  // Aquí tomamos el `id` de los parámetros de la URL

  const isValidObjectId = userId ? /^[a-fA-F0-9]{24}$/.test(userId) : false;

  if (!userId || !isValidObjectId) {
    return new Response("Invalid user ID", { status: 400 });
  }

  const db = await connectToDatabase();

  try {
    // Convertir el `userId` a `ObjectId` para que sea compatible con MongoDB
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { opinion } }
    );

    if (result.matchedCount === 0) {
      return new Response("User not found", { status: 404 });
    }

    return new Response("User opinion updated", { status: 200 });
  } catch (err) {
    console.error("Error updating user:", err);
    return new Response("Error updating user", { status: 500 });
  }
}