export interface SmsSender {
  send(to: string, body: string): Promise<{ id: string }>;
}

/** Identifies the project and offers an opt-out. */
export const confirmationSms = () =>
  "Neighborhood Listing Platform (class project): thanks for calling, we got your call. Reply STOP to opt out.";

/** Default sender: records messages in memory, calls nothing. */
export class SimulatorSmsSender implements SmsSender {
  outbox: { to: string; body: string }[] = [];
  async send(to: string, body: string) {
    this.outbox.push({ to, body });
    return { id: `SIM${this.outbox.length}` };
  }
}

/** Real sender via Twilio REST API (no SDK needed). Only constructed when explicitly enabled. */
export class TwilioSmsSender implements SmsSender {
  constructor(private sid: string, private token: string, private from: string) {}
  async send(to: string, body: string) {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${this.sid}:${this.token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: this.from, Body: body }),
    });
    if (!res.ok) throw new Error(`sms_http_${res.status}`); // status only, no body/PII
    const j = (await res.json()) as { sid: string };
    return { id: j.sid };
  }
}