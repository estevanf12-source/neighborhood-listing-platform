import { NextResponse } from "next/server";
import { serviceCreateSchema } from "@/schemas/service";
import { getAnonClient, getUserClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const PUBLIC_COLUMNS =
  "id, title, hourly_rate, duration_minutes, coverage_radius_miles";

export async function GET() {
  const supabase = getAnonClient();
  const { data, error } = await supabase
    .from("services")
    .select(PUBLIC_COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = serviceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const supabase = getUserClient(token);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  // provider_id comes from the verified session, never from the request body.
  // status is omitted so the DB default ('draft') applies; RLS enforces it.
  const { data, error } = await supabase
    .from("services")
    .insert({ ...parsed.data, provider_id: userData.user.id })
    .select(
      "id, provider_id, title, hourly_rate, duration_minutes, coverage_radius_miles, status, created_at"
    )
    .single();

  if (error) {
    if (error.code === "42501") {
      return NextResponse.json(
        { error: "Only provider accounts can create services" },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
