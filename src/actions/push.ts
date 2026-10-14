"use server";

import { z } from "zod";
import { requireUser } from "@/lib/data/user";
import { getPushConfig, sendPushToUser } from "@/lib/push/send";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const subscriptionSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }).max(1000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

/** Stores this browser's push subscription for the signed-in user. */
export async function savePushSubscription(input: unknown): Promise<{ ok: boolean }> {
  await requireUser();
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: parsed.data.endpoint,
    p_p256dh: parsed.data.keys.p256dh,
    p_auth: parsed.data.keys.auth,
  });
  return { ok: !error };
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  const user = await requireUser();
  if (typeof endpoint !== "string" || endpoint.length > 1000) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
}

/** Sends a sample notification to all of the user's devices. */
export async function sendTestPush(): Promise<{ delivered: number }> {
  const user = await requireUser();
  const config = getPushConfig();
  const admin = createSupabaseAdminClient();
  if (!config || !admin) return { delivered: 0 };
  const delivered = await sendPushToUser(admin, config, user.id, {
    title: "Opłacik: powiadomienia działają",
    body: "Tak będą wyglądać przypomnienia o płatnościach i końcu okresu próbnego.",
    url: "/panel",
    tag: "test",
  });
  return { delivered };
}
