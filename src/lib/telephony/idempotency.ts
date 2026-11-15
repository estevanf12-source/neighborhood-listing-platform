export type ClaimResult = "new" | "in_progress" | "done";

export interface IdempotencyStore {
  begin(key: string): Promise<ClaimResult>;
  complete(key: string): Promise<void>;
  release(key: string): Promise<void>; // on failure, so a provider retry can try again
}

/**
 * In-memory store: fine for the simulator and tests. On Vercel (serverless) memory is not shared
 * across instances, so production needs a durable store (e.g. a Supabase table with a UNIQUE
 * event_key column and INSERT ... ON CONFLICT DO NOTHING).
 */
export class MemoryIdempotencyStore implements IdempotencyStore {
  private m = new Map<string, "in_progress" | "done">();
  async begin(key: string): Promise<ClaimResult> {
    const s = this.m.get(key);
    if (s) return s;
    this.m.set(key, "in_progress");
    return "new";
  }
  async complete(key: string) { this.m.set(key, "done"); }
  async release(key: string) { this.m.delete(key); }
}