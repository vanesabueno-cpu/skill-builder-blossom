import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const saveSchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  step: z.number().int().min(0).max(10),
});

export const saveCvCloud = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const updatedAt = new Date().toISOString();
    const { error } = await context.supabase.from("cv_progress").upsert(
      {
        user_id: context.userId,
        payload: data.payload as never,
        step: data.step,
        updated_at: updatedAt,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { updatedAt };
  });

export const loadCvCloud = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cv_progress")
      .select("payload, step, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return { found: false as const };
    return {
      found: true as const,
      payload: data.payload as Record<string, unknown>,
      step: data.step,
      updatedAt: data.updated_at,
    };
  });
