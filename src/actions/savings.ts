"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/data/user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_TIPS = 300;
const TIP_KEY = /^[a-z]+:[0-9a-f,-]{1,800}$/;

/** "Zostawiam": hides a tip (e.g. two clouds) for good. */
export async function dismissTip(key: string): Promise<void> {
  const user = await requireUser();
  if (!TIP_KEY.test(key)) return;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("dismissed_tips").eq("id", user.id).maybeSingle();
  if (error || !data) return;
  const tips = data.dismissed_tips ?? [];
  if (tips.includes(key)) return;
  await supabase
    .from("profiles")
    .update({ dismissed_tips: [...tips, key].slice(-MAX_TIPS) })
    .eq("id", user.id);
  revalidatePath("/panel", "layout");
}
