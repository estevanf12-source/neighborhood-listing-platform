import { createStatusHandler } from "@/lib/telephony/handler";
import { getDeps } from "@/lib/telephony/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(req: Request) {
  try {
    return await createStatusHandler(getDeps())(req);
  } catch {
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}
// Every method goes through the handler so non-POST gets a 405 + Allow header.
export { handle as POST, handle as GET, handle as PUT, handle as PATCH, handle as DELETE };