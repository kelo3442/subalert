import Link from "next/link";
import { cn } from "./cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" fill="#c4f542" />
      <path
        d="M10 19.5c0 2.2 2.4 3.5 6 3.5s6-1.4 6-3.6c0-4.9-11.7-2.6-11.7-7.2 0-2 2.2-3.2 5.6-3.2 3.1 0 5.3 1.1 5.6 3.1"
        fill="none"
        stroke="#0c1002"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="23.5" cy="8.5" r="2.5" fill="#0c1002" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-lg", className)} aria-label="SubAlert — strona główna">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-fg">
        Sub<span className="text-accent">Alert</span>
      </span>
    </Link>
  );
}
