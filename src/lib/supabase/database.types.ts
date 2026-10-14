// Mirrors supabase/migrations. Regenerate with:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ReminderRow = {
  id: string;
  user_id: string;
  subscription_id: string;
  kind: "payment" | "trial_end";
  event_date: string;
  send_on: string;
  status: "pending" | "sending" | "sent" | "failed";
  attempts: number;
  last_error: string | null;
  provider_message_id: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

type DetectedRow = {
  id: string;
  user_id: string;
  message_id: string;
  name: string;
  amount_cents: number | null;
  billing_cycle: string;
  next_payment_date: string | null;
  trial_ends_at: string | null;
  category: string | null;
  manage_url: string | null;
  email_from: string | null;
  email_subject: string | null;
  received_at: string;
  status: "pending" | "added" | "dismissed";
  auto_added: boolean;
  subscription_id: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          time_zone: string;
          reminders_enabled: boolean;
          reminder_days_before: number;
          inbound_token: string;
          calendar_token: string;
          auto_add_detected: boolean;
          gmail_forwarding_code: string | null;
          gmail_forwarding_link: string | null;
          gmail_forwarding_received_at: string | null;
          premium_until: string | null;
          premium_source: "subscription" | "one_time" | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          time_zone?: string;
          reminders_enabled?: boolean;
          reminder_days_before?: number;
        };
        Update: {
          time_zone?: string;
          reminders_enabled?: boolean;
          reminder_days_before?: number;
          auto_add_detected?: boolean;
          gmail_forwarding_code?: string | null;
          gmail_forwarding_link?: string | null;
          gmail_forwarding_received_at?: string | null;
          premium_until?: string | null;
          premium_source?: "subscription" | "one_time" | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount_cents: number;
          amount_is_estimate: boolean;
          currency: string;
          billing_cycle: string;
          next_payment_date: string;
          trial_ends_at: string | null;
          category: string | null;
          manage_url: string | null;
          notes: string | null;
          status: string;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          amount_cents: number;
          amount_is_estimate?: boolean;
          currency?: string;
          billing_cycle: string;
          next_payment_date: string;
          trial_ends_at?: string | null;
          category?: string | null;
          manage_url?: string | null;
          notes?: string | null;
          status?: string;
          cancelled_at?: string | null;
        };
        Update: {
          name?: string;
          amount_cents?: number;
          amount_is_estimate?: boolean;
          billing_cycle?: string;
          next_payment_date?: string;
          trial_ends_at?: string | null;
          category?: string | null;
          manage_url?: string | null;
          notes?: string | null;
          status?: string;
          cancelled_at?: string | null;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: Record<never, never>;
        Update: Record<never, never>;
        Relationships: [];
      };
      detected_subscriptions: {
        Row: DetectedRow;
        Insert: Omit<DetectedRow, "id" | "created_at" | "status" | "auto_added" | "subscription_id" | "received_at"> & {
          status?: DetectedRow["status"];
          auto_added?: boolean;
          subscription_id?: string | null;
          received_at?: string;
        };
        // auto_added is writable only by the service role (column grant); users change status/subscription_id.
        Update: { status?: DetectedRow["status"]; subscription_id?: string | null; auto_added?: boolean };
        Relationships: [];
      };
      stripe_events: {
        Row: { id: string; type: string; created_at: string };
        Insert: { id: string; type: string };
        Update: Record<never, never>;
        Relationships: [];
      };
      reminders: {
        Row: ReminderRow;
        Insert: {
          id?: string;
          user_id: string;
          subscription_id: string;
          kind: "payment" | "trial_end";
          event_date: string;
          send_on: string;
          status?: ReminderRow["status"];
        };
        Update: {
          status?: ReminderRow["status"];
          last_error?: string | null;
          provider_message_id?: string | null;
          sent_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_premium: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      rotate_inbound_token: {
        Args: Record<never, never>;
        Returns: string;
      };
      rotate_calendar_token: {
        Args: Record<never, never>;
        Returns: string;
      };
      save_push_subscription: {
        Args: { p_endpoint: string; p_p256dh: string; p_auth: string };
        Returns: undefined;
      };
      delete_own_account: {
        Args: Record<never, never>;
        Returns: undefined;
      };
      claim_reminder: {
        Args: { p_reminder_id: string };
        Returns: ReminderRow[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
