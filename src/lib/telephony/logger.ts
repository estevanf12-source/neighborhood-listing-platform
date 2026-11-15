/**
 * The log type is a closed whitelist: there is no field that could hold a full phone number,
 * recording URL, message body, or token, so it cannot be logged by accident.
 */
export interface TelephonyLogEvent {
  event:
    | "received" | "rejected" | "duplicate" | "sms_sent"
    | "sms_skipped" | "sms_failed" | "status_callback" | "completed";
  eventId?: string;     // CallSid / MessageSid
  status?: string;      // provider status, e.g. "ringing", "completed"
  fromSuffix?: string;  // redactPhone() output only
  reason?: string;      // short machine-readable reason, never user input
}
export type LogSink = (line: string) => void;

export function createLogger(sink: LogSink = (l) => console.log(l)) {
  return (e: TelephonyLogEvent) =>
    sink(JSON.stringify({ ts: new Date().toISOString(), svc: "telephony", ...e }));
}
export type Logger = ReturnType<typeof createLogger>;