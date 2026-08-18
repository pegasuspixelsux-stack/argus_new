import Link from "next/link";
import type { Metadata } from "next";
import { Plus, TriangleAlert } from "lucide-react";

import { listVehicles } from "@/lib/data/vehicles";
import { VehicleTable } from "@/components/dashboard/vehicle-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Vehículos — Dealio" };
export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  let vehicles: Awaited<ReturnType<typeof listVehicles>> = [];
  let loadError: string | null = null;

  try {
    vehicles = await listVehicles();
  } catch {
    loadError = "No pudimos cargar tu stock de vehículos. Recarga la página.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Stock de vehículos
          </h1>
          <p className="text-sm text-muted-foreground">
            {vehicles.length} vehículo{vehicles.length === 1 ? "" : "s"} en tu
            stock
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/vehicles/new" />}>
          <Plus />
          Agregar vehículo
        </Button>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Algo salió mal</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : (
        <VehicleTable vehicles={vehicles} />
      )}
    </div>
  );
}
