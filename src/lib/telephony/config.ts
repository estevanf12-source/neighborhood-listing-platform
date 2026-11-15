import { createLogger } from "./logger";
import { MemoryIdempotencyStore } from "./idempotency";
import { SimulatorSmsSender, TwilioSmsSender, type SmsSender } from "./sms";
import type { TelephonyDeps } from "./handler";

let cached: TelephonyDeps | undefined;

/** Fails closed: missing token or public URL throws, which the route turns into a generic 500. */
export function getDeps(): TelephonyDeps {
  if (cached) return cached;
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
  const base = (process.env.TELEPHONY_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  if (!authToken || !base) throw new Error("telephony_not_configured");

  const smsEnabled = process.env.SMS_SENDING_ENABLED === "true"; // default false
  let sms: SmsSender = new SimulatorSmsSender();
  if (smsEnabled && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_FROM_NUMBER)
    sms = new TwilioSmsSender(process.env.TWILIO_ACCOUNT_SID, authToken, process.env.TWILIO_FROM_NUMBER);

  cached = {
    authToken,
    voiceUrl: `${base}/api/telephony/voice`,
    statusUrl: `${base}/api/telephony/status`,
    store: new MemoryIdempotencyStore(),
    sms,
    log: createLogger(),
    smsEnabled,
    consentedNumbers: new Set((process.env.SMS_CONSENTED_NUMBERS ?? "").split(",").map((s) => s.trim()).filter(Boolean)),
  };
  return cached;
}