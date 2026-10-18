import { BillsSection } from "@/components/landing/bills-section";
import { CalculatorSection } from "@/components/landing/calculator-section";
import { DemoSection } from "@/components/landing/demo-section";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { PricingSection } from "@/components/landing/pricing-section";
import { RemindersSection } from "@/components/landing/reminders-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { getEmailConfig } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/env";
import { earlyAccessPlacesLeft } from "@/lib/premium/early-access";

// The early-access counter is refreshed every few minutes.
export const revalidate = 300;

/** Structured data: tells search engines that "Opłacik" is this site's name. */
function structuredData() {
  const url = `${getSiteUrl()}/`;
  return JSON.stringify([
    { "@context": "https://schema.org", "@type": "WebSite", name: "Opłacik", alternateName: "oplacik.pl", url, inLanguage: "pl-PL" },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Opłacik",
      url,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web, Android, iOS",
      inLanguage: "pl-PL",
      description: "Subskrypcje i rachunki domowe w jednym miejscu, z przypomnieniami przed płatnością.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "PLN" },
    },
  ]).replace(/</g, "\\u003c");
}

export default async function HomePage() {
  const earlyAccessPlaces = await earlyAccessPlacesLeft();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData() }} />
      <SiteHeader />
      <main className="flex-1">
        <Hero earlyAccessPlaces={earlyAccessPlaces} />
        <DemoSection />
        <Features />
        <BillsSection />
        <CalculatorSection />
        <RemindersSection emailEnabled={getEmailConfig() !== null} />
        <PricingSection earlyAccessPlaces={earlyAccessPlaces} />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
