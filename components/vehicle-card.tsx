import Link from "next/link";
import { Car } from "lucide-react";

import type { Vehicle } from "@/types/vehicle";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function VehicleCard({
  vehicle,
  layout = "vertical",
}: {
  vehicle: Vehicle;
  layout?: "vertical" | "horizontal";
}) {
  const horizontal = layout === "horizontal";

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block">
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
          {vehicle.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.photos[0].url}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Car className="size-8" />
            </div>
          )}
        </div>
        <CardContent
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1 p-4",
            horizontal && "justify-center"
          )}
        >
          <h3 className="truncate font-medium text-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-muted-foreground">
            {vehicle.specs.mileage != null
              ? `${vehicle.specs.mileage.toLocaleString("es-UY")} km`
              : "Kilometraje a consultar"}
          </p>
          <p className="mt-1 font-semibold text-foreground">
            {vehicle.priceDisplay != null
              ? currency.format(vehicle.priceDisplay)
              : "Precio a consultar"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
