import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { WhoWeAreSection } from "@/components/who-we-are-section";
import { FeaturedPropertiesSection } from "@/components/featured-properties";
import { FeaturesSection } from "@/components/features-section";
import { DealerHighlightSection } from "@/components/dealer-highlight-section";
import { AboutSection } from "@/components/about-section";
import { FinancingPartnersTicker } from "@/components/financing-partners-ticker";
import { FinancingSection } from "@/components/financing-section";
import { AdvisoryCtaSection } from "@/components/advisory-cta-section";
import { ContactSection } from "@/components/contact-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <WhoWeAreSection />
        <FeaturedPropertiesSection />
        <FeaturesSection />
        <DealerHighlightSection />
        <AboutSection />
        <FinancingPartnersTicker />
        <FinancingSection />
        <AdvisoryCtaSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
