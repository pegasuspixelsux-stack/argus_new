"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bath, BedDouble, Building2, Car, ChevronLeft, ChevronRight } from "lucide-react";

import type { Property } from "@/types/property";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** "Apartamento en Playa Mansa" style type + location line. */
function locationLine(property: Property): string {
  return property.neighborhood
    ? `${PROPERTY_TYPE_LABELS[property.propertyType]} en ${property.neighborhood}`
    : PROPERTY_TYPE_LABELS[property.propertyType];
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
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/30 to-black/40"
        />

        {/* Section heading, overlaid at the top of the slide */}
        <div className="absolute inset-x-0 top-0 pt-8 sm:pt-12">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Propiedades Destacadas
            </h2>
            <p className="mt-2 max-w-md text-balance text-sm text-white/70 sm:text-base">
              Una selección de propiedades elegidas por nuestro equipo.
            </p>
          </div>
        </div>

        {/* Current property's info, anchored toward the bottom of the slide */}
        <div className="absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex max-w-lg flex-col items-start text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                {locationLine(property)}
              </p>
              <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                {property.title}
              </h3>
              {property.description ? (
                <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/80">
                  {property.description}
                </p>
              ) : null}

              {property.details.bedrooms != null ||
              property.details.bathrooms != null ||
              property.details.parkingSpaces != null ? (
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
                  {property.details.bedrooms != null ? (
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="size-4" />
                      {property.details.bedrooms}
                    </span>
                  ) : null}
                  {property.details.bathrooms != null ? (
                    <span className="flex items-center gap-1.5">
                      <Bath className="size-4" />
                      {property.details.bathrooms}
                    </span>
                  ) : null}
                  {property.details.parkingSpaces != null ? (
                    <span className="flex items-center gap-1.5">
                      <Car className="size-4" />
                      {property.details.parkingSpaces}
                    </span>
                  ) : null}
                </div>
              ) : null}

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
