import { createHmac, timingSafeEqual } from "node:crypto";

export type FormParams = Record<string, string[]>;

/** Parse an application/x-www-form-urlencoded body, keeping repeated keys. */
export function parseForm(raw: string): FormParams {
  const out: FormParams = {};
  for (const [k, v] of new URLSearchParams(raw)) (out[k] ??= []).push(v);
  return out;
}

/**
 * Twilio scheme: HMAC-SHA1(authToken, publicUrl + sorted(key + value ...)), base64.
 * `publicUrl` MUST be the exact URL configured at the provider (scheme, host, path, query).
 */
export function computeSignature(authToken: string, publicUrl: string, params: FormParams): string {
  let data = publicUrl;
  for (const key of Object.keys(params).sort()) {
    for (const value of [...params[key]].sort()) data += key + value;
  }
  return createHmac("sha1", authToken).update(data, "utf8").digest("base64");
}

/** Constant-time comparison; never trusts the caller-supplied header beyond comparing it. */
export function verifySignature(
  authToken: string,
  publicUrl: string,
  params: FormParams,
  headerValue: string | null,
): boolean {
  if (!headerValue) return false;
  const expected = Buffer.from(computeSignature(authToken, publicUrl, params));
  const given = Buffer.from(headerValue);
  return expected.length === given.length && timingSafeEqual(expected, given);
}