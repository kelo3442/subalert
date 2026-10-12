import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SetupRequired } from "@/components/auth/setup-required";
import { isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Logowanie" };

const NOTICES: Record<string, string> = {
  link: "Link jest nieprawidłowy lub wygasł. Zaloguj się albo poproś o nowy link.",
  "konto-usuniete": "Twoje konto i wszystkie dane zostały usunięte.",
};

export default async function LoginPage({ searchParams }: PageProps<"/logowanie">) {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  const params = await searchParams;
  const next = typeof params.next === "string" ? safeRedirectPath(params.next) : undefined;
  const noticeKey = typeof params.blad === "string" ? params.blad : typeof params.info === "string" ? params.info : "";
  const notice = NOTICES[noticeKey];

  return (
    <AuthCard
      title="Witaj ponownie"
      description="Zaloguj się, aby zobaczyć swoje subskrypcje."
      footer={
        <>
          Nie masz konta?{" "}
          <Link href="/rejestracja" className="font-medium text-accent hover:underline">
            Zarejestruj się
          </Link>
        </>
      }
    >
      <LoginForm next={next} notice={notice} />
    </AuthCard>
  );
}
