import type { APIContext } from "astro";

export async function GET({ request, clientAddress }: APIContext) {
  const ip = clientAddress || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return new Response(JSON.stringify({ ip, userAgent }), {
    headers: { "Content-Type": "application/json" },
  });
}