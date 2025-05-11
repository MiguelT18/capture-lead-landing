import type { APIContext } from "astro";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH({ request, params }: APIContext) {
  const { opinion } = await request.json();
  const userId = params.id;

  const isValidObjectId = userId ? /^[a-fA-F0-9]{24}$/.test(userId) : false;

  if (!userId || !isValidObjectId) {
    return new Response("Invalid user ID", { status: 400 });
  }

  const db = await connectToDatabase();

  try {
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
