import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SetupRequired } from "@/components/auth/setup-required";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Reset hasła" };

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  return (
    <AuthCard
      title="Nie pamiętasz hasła?"
      description="Podaj adres e-mail konta. Wyślemy link do ustawienia nowego hasła."
      footer={
        <Link href="/logowanie" className="font-medium text-accent hover:underline">
          Wróć do logowania
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
