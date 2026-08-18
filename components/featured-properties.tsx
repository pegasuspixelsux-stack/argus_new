import { listFeaturedProperties } from "@/lib/data/properties";
import { FeaturedCarousel } from "@/components/property/featured-carousel";
import { ScrollReveal } from "@/components/scroll-reveal";

export async function FeaturedPropertiesSection() {
  let properties: Awaited<ReturnType<typeof listFeaturedProperties>> = [];
  try {
    properties = await listFeaturedProperties(5);
  } catch {
    // Keep the marketing page usable even if Firestore is unreachable.
    return null;
  }

  if (properties.length === 0) return null;

  return (
    <section id="listings">
      <ScrollReveal>
        <FeaturedCarousel properties={properties} />
      </ScrollReveal>
    </section>
  );
}
