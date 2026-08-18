import Link from "next/link";
import { Building2 } from "lucide-react";

import type { Property } from "@/types/property";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-labels";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function summaryLine(property: Property): string {
  if (property.propertyType === "land") {
    return property.details.lotAreaM2 != null
      ? `${property.details.lotAreaM2.toLocaleString("es-UY")} m² de terreno`
      : "Superficie a consultar";
  }
  const parts: string[] = [];
  if (property.details.bedrooms != null) parts.push(`${property.details.bedrooms} dorm.`);
  if (property.details.bathrooms != null) parts.push(`${property.details.bathrooms} baños`);
  if (property.details.areaM2 != null) {
    parts.push(`${property.details.areaM2.toLocaleString("es-UY")} m²`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Detalles a consultar";
}

export function PropertyCard({
  property,
  layout = "vertical",
}: {
  property: Property;
  layout?: "vertical" | "horizontal";
}) {
  const horizontal = layout === "horizontal";

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <Card
        className={cn(
          "gap-0 overflow-hidden py-0 ring-border/60 transition-shadow group-hover:shadow-md",
          horizontal && "flex-row"
        )}
      >
        <div
          className={cn(
            "shrink-0 overflow-hidden bg-muted",
            horizontal ? "aspect-square w-2/5" : "aspect-4/3 w-full"
          )}
        >
          {property.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.photos[0].url}
              alt={property.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Building2 className="size-8" />
            </div>
          )}
        </div>
        <CardContent
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1 p-4",
            horizontal && "justify-center"
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </p>
          <h3 className="truncate font-medium text-foreground">{property.title}</h3>
          <p className="text-sm text-muted-foreground">{summaryLine(property)}</p>
          <p className="mt-1 font-semibold text-foreground">
            {property.priceDisplay != null
              ? currency.format(property.priceDisplay)
              : "Precio a consultar"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
