// src/schemas/service.ts
import { z } from "zod";

/**
 * Data contract for POST /api/services.
 * .strict() rejects unrecognized keys, so clients cannot inject
 * provider_id, status, id, or created_at. Those are set server-side.
 */
export const serviceCreateSchema = z
  .object({
    title: z.string().trim().min(5, "title must be at least 5 characters"),
    hourly_rate: z
      .number({ message: "hourly_rate must be a number" })
      .nonnegative("hourly_rate must be >= 0"),
    duration_minutes: z
      .number({ message: "duration_minutes must be a number" })
      .int("duration_minutes must be an integer")
      .min(15, "duration_minutes must be at least 15"),
    coverage_radius_miles: z
      .number({ message: "coverage_radius_miles must be a number" })
      .int("coverage_radius_miles must be an integer")
      .positive("coverage_radius_miles must be > 0"),
  })
  .strict();

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;


