import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { SetupRequired } from "@/components/auth/setup-required";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Rejestracja" };

export default function RegisterPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  return (
    <AuthCard
      title="Załóż konto"
      description="Zapisz subskrypcje i dostawaj przypomnienia przed płatnością."
      footer={
        <>
          Masz już konto?{" "}
          <Link href="/logowanie" className="font-medium text-accent hover:underline">
            Zaloguj się
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
