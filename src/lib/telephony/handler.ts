import { parseForm, verifySignature, type FormParams } from "./signature";
import { redactPhone } from "./redact";
import { voiceResponse, emptyResponse } from "./twiml";
import { confirmationSms, type SmsSender } from "./sms";
import type { IdempotencyStore } from "./idempotency";
import type { Logger } from "./logger";

export interface TelephonyDeps {
  authToken: string;
  voiceUrl: string;   // EXACT public callback URL configured at the provider
  statusUrl: string;  // same, for the status callback
  store: IdempotencyStore;
  sms: SmsSender;
  log: Logger;
  smsEnabled: boolean;           // env flag, defaults to false
  consentedNumbers: Set<string>; // explicit consent allowlist (E.164)
  maxBodyBytes?: number;
}

const xml = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/xml; charset=utf-8" } });
const fail = (status: number, extra: HeadersInit = {}) =>
  new Response(JSON.stringify({ error: "request_rejected" }), { // generic: no detail leaks
    status, headers: { "Content-Type": "application/json", ...extra },
  });

type Guard = { ok: true; params: FormParams } | { ok: false; res: Response };

async function guard(req: Request, publicUrl: string, required: string[], d: TelephonyDeps): Promise<Guard> {
  const max = d.maxBodyBytes ?? 4096;
  const reject = (status: number, reason: string, extra?: HeadersInit): Guard => {
    d.log({ event: "rejected", reason });
    return { ok: false, res: fail(status, extra) };
  };
  if (req.method !== "POST") return reject(405, "method", { Allow: "POST" });
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/x-www-form-urlencoded"))
    return reject(415, "content_type");
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > max) return reject(413, "too_large");
  const raw = await req.text(); // raw body, exactly as received
  if (Buffer.byteLength(raw) > max) return reject(413, "too_large");
  const params = parseForm(raw);
  // Signature is checked against OUR configured public URL, never req.url or a caller-set header.
  if (!verifySignature(d.authToken, publicUrl, params, req.headers.get("x-twilio-signature")))
    return reject(403, "bad_signature");
  for (const f of required) if (!params[f]?.[0]) return reject(400, "missing_field");
  return { ok: true, params };
}

/** Inbound call -> TwiML now, optional SMS as a side effect (at most once per CallSid). */
export function createVoiceHandler(d: TelephonyDeps) {
  return async (req: Request): Promise<Response> => {
    const g = await guard(req, d.voiceUrl, ["CallSid", "From", "To"], d);
    if (!g.ok) return g.res;
    const callSid = g.params.CallSid[0];
    const from = g.params.From[0];
    const fromSuffix = redactPhone(from);
    const key = `voice:${callSid}`;

    if ((await d.store.begin(key)) !== "new") {
      d.log({ event: "duplicate", eventId: callSid, fromSuffix });
      return xml(voiceResponse()); // same answer on provider retry, no side effects
    }
    d.log({ event: "received", eventId: callSid, status: g.params.CallStatus?.[0], fromSuffix });

    try {
      if (!d.smsEnabled) d.log({ event: "sms_skipped", eventId: callSid, reason: "flag_off" });
      else if (!d.consentedNumbers.has(from)) d.log({ event: "sms_skipped", eventId: callSid, reason: "no_consent" });
      else {
        const { id } = await d.sms.send(from, confirmationSms());
        d.log({ event: "sms_sent", eventId: id, fromSuffix });
      }
      await d.store.complete(key);
    } catch {
      await d.store.release(key); // let the provider retry
      d.log({ event: "sms_failed", eventId: callSid, reason: "send_error" });
      return fail(500);
    }
    return xml(voiceResponse());
  };
}

/** Status callback: log + dedupe on (sid, status). */
export function createStatusHandler(d: TelephonyDeps) {
  return async (req: Request): Promise<Response> => {
    const g = await guard(req, d.statusUrl, ["MessageSid", "MessageStatus"], d);
    if (!g.ok) return g.res;
    const sid = g.params.MessageSid[0];
    const status = g.params.MessageStatus[0];
    const key = `status:${sid}:${status}`;
    if ((await d.store.begin(key)) !== "new") {
      d.log({ event: "duplicate", eventId: sid, status });
      return xml(emptyResponse());
    }
    d.log({ event: "status_callback", eventId: sid, status });
    await d.store.complete(key);
    return xml(emptyResponse());
  };
}