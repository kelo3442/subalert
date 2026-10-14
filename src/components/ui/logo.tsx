import Link from "next/link";
import { cn } from "./cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" fill="#c4f542" />
      {/* An open "O" closed by a tick: paid. */}
      <path d="M16 6.8a9.2 9.2 0 1 0 9.2 9.2" fill="none" stroke="#0c1002" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M12 16.2l3 3 9.2-9.6" fill="none" stroke="#0c1002" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-lg", className)} aria-label="Opłacik — strona główna">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-fg">Opłacik</span>
    </Link>
  );
}
