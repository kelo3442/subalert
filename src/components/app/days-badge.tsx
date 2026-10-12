import { Badge } from "@/components/ui/badge";
import { formatRelativeDays } from "@/lib/dates";
import { NEAR_PAYMENT_DAYS } from "@/lib/subscriptions/schedule";

export function DaysBadge({ days }: { days: number }) {
  const tone = days < 0 ? "neutral" : days <= 1 ? "danger" : days <= NEAR_PAYMENT_DAYS ? "warn" : "neutral";
  return <Badge tone={tone}>{formatRelativeDays(days)}</Badge>;
}
