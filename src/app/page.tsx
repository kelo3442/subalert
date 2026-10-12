import { BillsSection } from "@/components/landing/bills-section";
import { CalculatorSection } from "@/components/landing/calculator-section";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { PricingSection } from "@/components/landing/pricing-section";
import { RemindersSection } from "@/components/landing/reminders-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { getEmailConfig } from "@/lib/email/resend";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <BillsSection />
        <CalculatorSection />
        <RemindersSection emailEnabled={getEmailConfig() !== null} />
        <PricingSection />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
