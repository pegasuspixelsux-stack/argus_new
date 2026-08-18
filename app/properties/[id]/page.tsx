import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Home, Ruler, Tag, TriangleAlert } from "lucide-react";

import { tryGetPublishedProperty } from "@/lib/data/properties";
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/property-labels";
import { PhotoGallery } from "@/components/property/photo-gallery";
import { PriceDisplay } from "@/components/property/price-display";
import { LeadForm } from "@/components/property/lead-form";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function getAbsoluteUrl(pathname: string) {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}${pathname}`;
}

export async function generateMetadata(
  { params }: PageProps<"/properties/[id]">
): Promise<Metadata> {
  const { id } = await params;
  const { property } = await tryGetPublishedProperty(id);
  if (!property) return { title: "Propiedad no encontrada — Argus" };

  return {
    title: `${property.title} — Argus`,
    description: property.description || `Ver los detalles de ${property.title}.`,
  };
}

export default async function PublicPropertyPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const { property, error } = await tryGetPublishedProperty(id);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Esta página no está disponible en este momento</AlertTitle>
          <AlertDescription>
            No pudimos cargar esta propiedad. Inténtalo de nuevo en unos minutos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!property) notFound();

  const propertyUrl = await getAbsoluteUrl(`/properties/${property.id}`);
  const whatsappNumber = process.env.NEXT_PUBLIC_SALES_WHATSAPP_NUMBER;

  const specs = [
    { icon: Tag, label: "Operación", value: LISTING_TYPE_LABELS[property.listingType] },
    { icon: Home, label: "Tipo", value: PROPERTY_TYPE_LABELS[property.propertyType] },
    {
      icon: BedDouble,
      label: "Dormitorios",
      value: property.details.bedrooms != null ? String(property.details.bedrooms) : null,
    },
    {
      icon: Bath,
      label: "Baños",
      value: property.details.bathrooms != null ? String(property.details.bathrooms) : null,
    },
    {
      icon: Ruler,
      label: "Superficie",
      value:
        property.details.areaM2 != null
          ? `${property.details.areaM2.toLocaleString("es-UY")} m²`
          : null,
    },
  ].filter((spec) => spec.value);

  const hasAdditionalDetails =
    property.details.lotAreaM2 != null ||
    property.details.yearBuilt != null ||
    property.details.parkingSpaces != null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <PhotoGallery photos={property.photos} title={property.title} />

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {property.title}
            </h1>
            {property.neighborhood || property.city ? (
              <p className="mt-1 text-muted-foreground">
                {[property.neighborhood, property.city].filter(Boolean).join(", ")}
              </p>
            ) : null}
          </div>

          {specs.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4"
                >
                  <spec.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{spec.value}</span>
                  <span className="text-xs text-muted-foreground">{spec.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {property.description ? (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </div>
          ) : null}

          {hasAdditionalDetails && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Detalles adicionales
              </h2>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {property.details.lotAreaM2 != null ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">Superficie del terreno</dt>
                    <dd className="font-medium text-foreground">
                      {property.details.lotAreaM2.toLocaleString("es-UY")} m²
                    </dd>
                  </div>
                ) : null}
                {property.details.yearBuilt != null ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">Año de construcción</dt>
                    <dd className="font-medium text-foreground">{property.details.yearBuilt}</dd>
                  </div>
                ) : null}
                {property.details.parkingSpaces != null ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">Cocheras</dt>
                    <dd className="font-medium text-foreground">{property.details.parkingSpaces}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <PriceDisplay
                priceDisplay={property.priceDisplay}
                priceCompareAt={property.priceCompareAt}
                listingType={property.listingType}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <WhatsAppButton
                phoneNumber={whatsappNumber}
                propertyTitle={property.title}
                propertyUrl={propertyUrl}
              />

              <Separator />

              <div>
                <CardTitle className="mb-3 text-base">Consultá por esta propiedad</CardTitle>
                <LeadForm propertyId={property.id} propertyTitle={property.title} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
