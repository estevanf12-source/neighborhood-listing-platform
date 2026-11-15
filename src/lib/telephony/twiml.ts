/** Minimal valid TwiML. Static text only: caller-supplied data is never echoed back. */
export function voiceResponse(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thanks for calling the Neighborhood Listing Platform class project. Goodbye.</Say><Hangup/></Response>`;
}
export const emptyResponse = () => `<?xml version="1.0" encoding="UTF-8"?><Response/>`;