import type { Metadata } from "next";

import { VehicleForm } from "@/components/dashboard/vehicle-form";

export const metadata: Metadata = { title: "Agregar vehículo — Dealio" };

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Agregar vehículo
        </h1>
        <p className="text-sm text-muted-foreground">
          Completa los datos y publica cuando esté listo para salir en vivo.
        </p>
      </div>
      <VehicleForm mode="create" />
    </div>
  );
}
