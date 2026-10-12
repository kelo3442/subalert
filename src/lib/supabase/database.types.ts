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
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount_cents: number;
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
      claim_reminder: {
        Args: { p_reminder_id: string };
        Returns: ReminderRow[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
