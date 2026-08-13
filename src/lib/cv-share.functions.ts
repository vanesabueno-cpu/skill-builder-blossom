import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const payloadSchema = z.object({ payload: z.record(z.string(), z.unknown()) });
const tokenSchema = z.object({ token: z.string().min(6).max(64) });

function makeToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32])
    .join("");
}

export const createCvShare = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = makeToken();
    const { error } = await supabaseAdmin
      .from("cv_shares")
      .insert({ token, payload: data.payload as never });
    if (error) throw new Error(error.message);
    return { token };
  });

export const getCvShare = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("cv_shares")
      .select("payload, expires_at")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { payload: null };
    if (new Date(row.expires_at).getTime() < Date.now()) return { payload: null };
    return { payload: row.payload as unknown };
  });
