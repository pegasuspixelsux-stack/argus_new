"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, ChevronLeft, ChevronRight } from "lucide-react";

import type { Property } from "@/types/property";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** "Apartamento en Playa Mansa, 3 dormitorios, 2 baños" style summary line. */
function summaryLine(property: Property): string {
  const parts: string[] = [
    property.neighborhood
      ? `${PROPERTY_TYPE_LABELS[property.propertyType]} en ${property.neighborhood}`
      : PROPERTY_TYPE_LABELS[property.propertyType],
  ];
  if (property.details.bedrooms != null) {
    parts.push(`${property.details.bedrooms} dormitorio${property.details.bedrooms === 1 ? "" : "s"}`);
  }
  if (property.details.bathrooms != null) {
    parts.push(`${property.details.bathrooms} baño${property.details.bathrooms === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

/**
 * Full-width, 16:9 carousel styled to match HeroSection exactly: a dark
 * left-to-right gradient over the photo with white text overlaid directly
 * on it (no floating card), same container width and button treatment.
 */
export function FeaturedCarousel({ properties }: { properties: Property[] }) {
  const [index, setIndex] = useState(0);
  const property = properties[index];

  function goTo(next: number) {
    setIndex((next + properties.length) % properties.length);
  }

  return (
    <div>
      <div className="relative isolate aspect-video w-full overflow-hidden border-b border-border/60">
        <AnimatePresence mode="wait">
          <motion.div
            key={property.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 -z-20"
          >
            {property.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.photos[0].url}
                alt={property.title}
                className="size-full object-cover object-center"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                <Building2 className="size-12" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/50 to-black/10"
        />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex max-w-lg flex-col items-start text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                {summaryLine(property)}
              </p>
              <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                {property.title}
              </h3>
              <p className="mt-3 text-lg font-semibold text-white sm:text-xl">
                {property.priceDisplay != null
                  ? currency.format(property.priceDisplay)
                  : "Precio a consultar"}
                {property.priceDisplay != null && property.listingType === "rent" ? (
                  <span className="font-normal text-white/70">/mes</span>
                ) : null}
              </p>
              <Button
                size="lg"
                className="mt-6 w-full sm:w-auto"
                nativeButton={false}
                render={<Link href={`/properties/${property.id}`} />}
              >
                Ver más
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        {properties.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Propiedad anterior"
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Propiedad siguiente"
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {properties.length > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          {properties.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir a la propiedad ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-1.5 bg-border"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
