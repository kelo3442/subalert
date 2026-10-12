import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { cn } from "@/components/ui/cn";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg",
          className,
        )}
      >
        <LogOut className="size-[18px]" aria-hidden />
        Wyloguj się
      </button>
    </form>
  );
}
