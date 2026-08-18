import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Fuel, Gauge, Palette, Settings2, TriangleAlert } from "lucide-react";

import { tryGetPublishedVehicle } from "@/lib/data/vehicles";
import { PhotoGallery } from "@/components/vehicle/photo-gallery";
import { PriceDisplay } from "@/components/vehicle/price-display";
import { LeadForm } from "@/components/vehicle/lead-form";
import { WhatsAppButton } from "@/components/vehicle/whatsapp-button";
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
  { params }: PageProps<"/vehicles/[id]">
): Promise<Metadata> {
  const { id } = await params;
  const { vehicle } = await tryGetPublishedVehicle(id);
  if (!vehicle) return { title: "Vehículo no encontrado — Dealio" };

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  return {
    title: `${title} — Dealio`,
    description: vehicle.description || `Ver los detalles de ${title}.`,
  };
}

const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: "Automática",
  manual: "Manual",
  cvt: "CVT",
  "dual-clutch": "Doble embrague",
};

const FUEL_LABELS: Record<string, string> = {
  gasoline: "Nafta",
  diesel: "Diésel",
  hybrid: "Híbrido",
  electric: "Eléctrico",
  "plug-in-hybrid": "Híbrido enchufable",
};

export default async function PublicVehiclePage({ params }: PageProps<"/vehicles/[id]">) {
  const { id } = await params;
  const { vehicle, error } = await tryGetPublishedVehicle(id);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Esta página no está disponible en este momento</AlertTitle>
          <AlertDescription>
            No pudimos cargar este vehículo. Inténtalo de nuevo en unos minutos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!vehicle) notFound();

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const vehicleUrl = await getAbsoluteUrl(`/vehicles/${vehicle.id}`);
  const whatsappNumber = process.env.NEXT_PUBLIC_SALES_WHATSAPP_NUMBER;

  const specs = [
    {
      icon: Gauge,
      label: "Kilometraje",
      value: vehicle.specs.mileage != null ? `${vehicle.specs.mileage.toLocaleString("es-UY")} km` : null,
    },
    {
      icon: Settings2,
      label: "Transmisión",
      value: vehicle.specs.transmission ? TRANSMISSION_LABELS[vehicle.specs.transmission] : null,
    },
    {
      icon: Fuel,
      label: "Combustible",
      value: vehicle.specs.fuelType ? FUEL_LABELS[vehicle.specs.fuelType] : null,
    },
    {
      icon: Palette,
      label: "Color exterior",
      value: vehicle.specs.exteriorColor || null,
    },
  ].filter((spec) => spec.value);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <PhotoGallery photos={vehicle.photos} title={title} />

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {vehicle.specs.bodyType ? (
              <p className="mt-1 text-muted-foreground">{vehicle.specs.bodyType}</p>
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

          {vehicle.description ? (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {vehicle.description}
              </p>
            </div>
          ) : null}

          {(vehicle.specs.interiorColor || vehicle.specs.vin) && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Detalles adicionales
              </h2>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {vehicle.specs.interiorColor ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">Color interior</dt>
                    <dd className="font-medium text-foreground">{vehicle.specs.interiorColor}</dd>
                  </div>
                ) : null}
                {vehicle.specs.vin ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">VIN</dt>
                    <dd className="font-medium text-foreground">{vehicle.specs.vin}</dd>
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
                priceDisplay={vehicle.priceDisplay}
                priceCompareAt={vehicle.priceCompareAt}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <WhatsAppButton
                phoneNumber={whatsappNumber}
                vehicleTitle={title}
                vehicleUrl={vehicleUrl}
              />

              <Separator />

              <div>
                <CardTitle className="mb-3 text-base">Consultá por este vehículo</CardTitle>
                <LeadForm vehicleId={vehicle.id} vehicleTitle={title} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
