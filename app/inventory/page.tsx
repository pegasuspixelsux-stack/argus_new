import type { Metadata } from "next";

import { listPublishedVehicles } from "@/lib/data/vehicles";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InventoryView } from "@/components/inventory/inventory-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Stock disponible — Dealio",
  description: "Explora todo el stock disponible en Dealio y filtra por año, marca, modelo y precio.",
};

export default async function InventoryPage() {
  let vehicles: Awaited<ReturnType<typeof listPublishedVehicles>> = [];
  let loadError = false;
  try {
    vehicles = await listPublishedVehicles(12);
  } catch {
    loadError = true;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 pt-24 pb-20 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Stock disponible
            </h1>
            <p className="mt-2 text-muted-foreground">
              Filtra por año, marca, modelo y precio para encontrar tu próximo vehículo.
            </p>
          </div>

          {loadError ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Algo salió mal</AlertTitle>
              <AlertDescription>
                No pudimos cargar el stock de vehículos. Recarga la página.
              </AlertDescription>
            </Alert>
          ) : (
            <InventoryView vehicles={vehicles} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
