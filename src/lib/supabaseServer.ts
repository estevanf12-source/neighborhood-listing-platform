// Server-only: importing this from a client component fails the build.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** Anonymous client: RLS applies as the `anon` role (public approved-service reads). */
export function getAnonClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    opts
  );
}

/** Per-request client acting as the signed-in user: RLS applies as that user. */
export function getUserClient(accessToken: string): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { ...opts, global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}

/**
 * Elevated client (bypasses RLS). SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_
 * prefix, so it is never bundled for the browser. Use only for admin/server tasks.
 */
export function getServiceClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    opts
  );
}
