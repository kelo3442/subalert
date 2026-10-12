import "server-only";
import { cache } from "react";
import { SUBSCRIPTION_COLUMNS, subscriptionFromRow } from "@/lib/subscriptions/mapping";
import type { Subscription } from "@/lib/subscriptions/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "./user";

export class DataLoadError extends Error {}

// RLS limits rows to the signed-in user; the explicit user_id filter is a
// second line of defence and helps the query planner use the index.
export const listSubscriptions = cache(async (): Promise<Subscription[]> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw new DataLoadError("Nie udało się wczytać subskrypcji.");
  return data.map(subscriptionFromRow).filter((s): s is Subscription => s !== null);
});

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export const getSubscription = cache(async (id: string): Promise<Subscription | null> => {
  if (!isUuid(id)) return null;
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new DataLoadError("Nie udało się wczytać subskrypcji.");
  return data ? subscriptionFromRow(data) : null;
});
