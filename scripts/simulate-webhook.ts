/**
 * Simulator: signs a saved fixture exactly like Twilio and POSTs it to your local server.
 * No Twilio account needed. Usage:
 *   npm run simulate:telephony -- voice-inbound [--tamper] [--replay]
 * Needs TWILIO_AUTH_TOKEN and TELEPHONY_PUBLIC_BASE_URL in the environment (same values the app uses).
 */
import { readFileSync } from "node:fs";
import { computeSignature } from "../src/lib/telephony/signature";

async function main() {
  const [name = "voice-inbound", ...flags] = process.argv.slice(2);
  const token = process.env.TWILIO_AUTH_TOKEN;
  const base = (process.env.TELEPHONY_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  if (!token || !base) {
    console.error("Set TWILIO_AUTH_TOKEN and TELEPHONY_PUBLIC_BASE_URL");
    process.exit(1);
  }

  const fields = JSON.parse(readFileSync(`fixtures/telephony/${name}.json`, "utf8")) as Record<string, string>;
  const path = name.startsWith("status") ? "/api/telephony/status" : "/api/telephony/voice";
  const url = base + path;
  const sig = computeSignature(token, url, Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, [v]])));
  const body = new URLSearchParams(fields).toString();

  async function send(label: string, payload: string, signature: string) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Twilio-Signature": signature },
      body: payload,
    });
    console.log(`${label}: HTTP ${r.status}`);
  }

  await send("signed request", flags.includes("--tamper") ? body + "&Extra=1" : body, sig);
  if (flags.includes("--replay")) await send("replayed request", body, sig);
}

main().catch((e) => {
  console.error("simulator failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});