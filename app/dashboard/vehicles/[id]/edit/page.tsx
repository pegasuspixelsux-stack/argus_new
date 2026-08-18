import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getVehicle } from "@/lib/data/vehicles";
import { VehicleForm } from "@/components/dashboard/vehicle-form";

export const metadata: Metadata = { title: "Editar vehículo — Dealio" };

export default async function EditVehiclePage({ params }: PageProps<"/dashboard/vehicles/[id]/edit">) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <p className="text-sm text-muted-foreground">Actualiza los datos de esta publicación.</p>
      </div>
      <VehicleForm mode="edit" vehicle={vehicle} />
    </div>
  );
}
