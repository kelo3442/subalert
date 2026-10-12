import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SubAlert — kontroluj swoje subskrypcje",
    template: "%s · SubAlert",
  },
  description:
    "Przestań tracić pieniądze na subskrypcje, o których zapominasz. Subskrypcje i rachunki domowe w jednym miejscu, koszty miesięczne i roczne oraz przypomnienia przed płatnością.",
  openGraph: { locale: "pl_PL", siteName: "SubAlert", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
