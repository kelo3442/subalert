import "server-only";
import webpush from "web-push";
import { getLegalInfo } from "@/lib/legal";
import type { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface PushPayload {
  title: string;
  body: string;
  /** Path inside the app opened when the notification is tapped. */
  url: string;
  /** Notifications with the same tag replace each other instead of piling up. */
  tag?: string;
}

export interface PushConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

/** VAPID keys from `npx web-push generate-vapid-keys`; null when push is not set up. */
export function getPushConfig(): PushConfig | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) return null;
  const contact = process.env.VAPID_SUBJECT?.trim() || `mailto:${getLegalInfo().contactEmail}`;
  return { publicKey, privateKey, subject: contact };
}

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

/**
 * Sends a notification to every device of the user. Devices whose
 * subscription expired (404/410 from the push service) are removed.
 * Returns how many devices accepted the message.
 */
export async function sendPushToUser(admin: AdminClient, config: PushConfig, userId: string, payload: PushPayload): Promise<number> {
  const { data: devices, error } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", userId);
  if (error || !devices?.length) return 0;

  const body = JSON.stringify(payload);
  const results = await Promise.all(
    devices.map(async (device) => {
      try {
        await webpush.sendNotification({ endpoint: device.endpoint, keys: { p256dh: device.p256dh, auth: device.auth } }, body, {
          vapidDetails: { subject: config.subject, publicKey: config.publicKey, privateKey: config.privateKey },
          TTL: 60 * 60 * 24,
          urgency: "normal",
        });
        return true;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", device.id);
        } else {
          console.error("Push failed", status ?? (error as Error).message);
        }
        return false;
      }
    }),
  );
  return results.filter(Boolean).length;
}
