import { ArrowLeft, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { NewPasswordForm } from "@/components/app/new-password-form";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Zmiana hasła" };

/** Also the landing page of the password-reset e-mail link. */
export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        back={
          <Link href="/panel/ustawienia" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden /> Ustawienia
          </Link>
        }
        title="Zmiana hasła"
      />
      <Card>
        <CardHeader
          icon={<KeyRound className="size-5" aria-hidden />}
          title="Ustaw nowe hasło"
          description="Po zapisaniu zalogujesz się nim przy następnym logowaniu."
        />
        <div className="p-5">
          <NewPasswordForm />
        </div>
      </Card>
    </div>
  );
}
