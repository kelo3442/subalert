import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Opłacik — subskrypcje i rachunki pod kontrolą",
    template: "%s · Opłacik",
  },
  description:
    "Wszystkie stałe opłaty w jednym miejscu: subskrypcje i rachunki domowe z każdego banku. Opłacik przypomni, zanim zapłacisz, i da znać, gdy coś podrożeje.",
  openGraph: { locale: "pl_PL", siteName: "Opłacik", type: "website" },
  twitter: { card: "summary_large_image" },
  applicationName: "Opłacik",
  appleWebApp: { capable: true, title: "Opłacik", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <SiteAnalytics />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
