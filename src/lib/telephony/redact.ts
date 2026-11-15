/** Keep only the last 4 digits. Never log a full number. */
export function redactPhone(value: string | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 4 ? `***${digits.slice(-4)}` : "***";
}