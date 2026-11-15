import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createVoiceHandler, createStatusHandler, type TelephonyDeps } from "../src/lib/telephony/handler";
import { computeSignature } from "../src/lib/telephony/signature";
import { MemoryIdempotencyStore } from "../src/lib/telephony/idempotency";
import { SimulatorSmsSender } from "../src/lib/telephony/sms";
import { createLogger } from "../src/lib/telephony/logger";

const TOKEN = "test-token-not-a-secret";
const VOICE_URL = "https://example.test/api/telephony/voice";
const STATUS_URL = "https://example.test/api/telephony/status";
const load = (f: string) => JSON.parse(readFileSync(`fixtures/telephony/${f}`, "utf8")) as Record<string, string>;
const voiceFx = load("voice-inbound.json");
const statusFx = load("status-delivered.json");

function setup(over: Partial<TelephonyDeps> = {}) {
  const sms = new SimulatorSmsSender();
  const logs: string[] = [];
  const deps: TelephonyDeps = {
    authToken: TOKEN, voiceUrl: VOICE_URL, statusUrl: STATUS_URL,
    store: new MemoryIdempotencyStore(), sms, log: createLogger((l) => logs.push(l)),
    smsEnabled: true, consentedNumbers: new Set([voiceFx.From]), ...over,
  };
  return { deps, sms, logs, voice: createVoiceHandler(deps), status: createStatusHandler(deps) };
}

function post(url: string, fields: Record<string, string>, opts: { sig?: string | null; signUrl?: string; raw?: string; method?: string; ct?: string } = {}) {
  const body = opts.raw ?? new URLSearchParams(fields).toString();
  const headers: Record<string, string> = { "Content-Type": opts.ct ?? "application/x-www-form-urlencoded" };
  const sig = opts.sig === undefined
    ? computeSignature(TOKEN, opts.signUrl ?? url, Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, [v]])))
    : opts.sig;
  if (sig !== null) headers["X-Twilio-Signature"] = sig;
  const method = opts.method ?? "POST";
  return new Request(url, { method, headers, body: method === "GET" ? undefined : body });
}

test("valid signature -> 200 TwiML, SMS sent once to consenting number", async () => {
  const t = setup();
  const res = await t.voice(post(VOICE_URL, voiceFx));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type")!, /text\/xml/);
  assert.match(await res.text(), /^<\?xml.*<Response>.*<\/Response>$/);
  assert.equal(t.sms.outbox.length, 1);
  assert.match(t.sms.outbox[0].body, /Reply STOP/);
});

test("invalid signature -> 403, no SMS", async () => {
  const t = setup();
  const res = await t.voice(post(VOICE_URL, voiceFx, { sig: "AAAAAAAAAAAAAAAAAAAAAAAAAAA=" }));
  assert.equal(res.status, 403);
  assert.equal(t.sms.outbox.length, 0);
});

test("missing signature header -> 403", async () => {
  const t = setup();
  assert.equal((await t.voice(post(VOICE_URL, voiceFx, { sig: null }))).status, 403);
});

test("signature computed for a different URL (URL mismatch) -> 403", async () => {
  const t = setup();
  const res = await t.voice(post(VOICE_URL, voiceFx, { signUrl: "https://attacker.test/api/telephony/voice" }));
  assert.equal(res.status, 403);
});

test("tampered body after signing -> 403", async () => {
  const t = setup();
  const signed = new URLSearchParams(voiceFx).toString();
  const sig = computeSignature(TOKEN, VOICE_URL, Object.fromEntries(Object.entries(voiceFx).map(([k, v]) => [k, [v]])));
  const res = await t.voice(post(VOICE_URL, voiceFx, { sig, raw: signed + "&From=%2B15555559999" }));
  assert.equal(res.status, 403);
});

test("missing required field (validly signed) -> 400", async () => {
  const t = setup();
  const { CallSid, ...rest } = voiceFx;
  void CallSid;
  const res = await t.voice(post(VOICE_URL, rest));
  assert.equal(res.status, 400);
  assert.equal(t.sms.outbox.length, 0);
});

test("duplicate event creates no duplicate SMS", async () => {
  const t = setup();
  await t.voice(post(VOICE_URL, voiceFx));
  const second = await t.voice(post(VOICE_URL, voiceFx));
  assert.equal(second.status, 200);
  assert.equal(t.sms.outbox.length, 1);
});

test("provider retry after failed send is allowed, then dedupes", async () => {
  let calls = 0;
  const flaky = { async send() { if (calls++ === 0) throw new Error("boom"); return { id: "SMok" }; } };
  const t = setup({ sms: flaky });
  assert.equal((await t.voice(post(VOICE_URL, voiceFx))).status, 500); // provider will retry
  assert.equal((await t.voice(post(VOICE_URL, voiceFx))).status, 200); // retry succeeds
  assert.equal((await t.voice(post(VOICE_URL, voiceFx))).status, 200); // later duplicate
  assert.equal(calls, 2);                                              // exactly one success
});

test("SMS flag defaults off: no message even with consent", async () => {
  const t = setup({ smsEnabled: false });
  assert.equal((await t.voice(post(VOICE_URL, voiceFx))).status, 200);
  assert.equal(t.sms.outbox.length, 0);
});

test("no consent: no message", async () => {
  const t = setup({ consentedNumbers: new Set() });
  await t.voice(post(VOICE_URL, voiceFx));
  assert.equal(t.sms.outbox.length, 0);
});

test("wrong method -> 405 with Allow; wrong content type -> 415; oversized -> 413", async () => {
  const t = setup();
  const get = await t.voice(post(VOICE_URL, voiceFx, { method: "GET" }));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "POST");
  assert.equal((await t.voice(post(VOICE_URL, voiceFx, { ct: "application/json" }))).status, 415);
  const big = { ...voiceFx, Padding: "x".repeat(5000) };
  assert.equal((await t.voice(post(VOICE_URL, big))).status, 413);
});

test("logs contain no full phone numbers, no token, no SMS body", async () => {
  const t = setup();
  await t.voice(post(VOICE_URL, voiceFx));
  await t.voice(post(VOICE_URL, voiceFx, { sig: "bad" }));
  const all = t.logs.join("\n");
  assert.ok(!all.includes(voiceFx.From) && !all.includes(voiceFx.To));
  assert.ok(!all.includes(TOKEN) && !all.includes("Reply STOP"));
  assert.ok(all.includes("***0123") && all.includes(voiceFx.CallSid));
});

test("status callback: valid, duplicate deduped, bad signature rejected", async () => {
  const t = setup();
  assert.equal((await t.status(post(STATUS_URL, statusFx))).status, 200);
  assert.equal((await t.status(post(STATUS_URL, statusFx))).status, 200);
  assert.equal(t.logs.filter((l) => l.includes('"status_callback"')).length, 1);
  assert.equal((await t.status(post(STATUS_URL, statusFx, { sig: "nope" }))).status, 403);
});

test("signature algorithm matches Twilio's documented example vector", () => {
  const sig = computeSignature("12345", "https://mycompany.com/myapp.php?foo=1&bar=2", {
    CallSid: ["CA1234567890ABCDE"], Caller: ["+14158675310"], Digits: ["1234"],
    From: ["+14158675310"], To: ["+18005551212"],
  });
  assert.equal(sig, "GvWf1cFY/Q7PnoempGyD5oXAezc=");
});