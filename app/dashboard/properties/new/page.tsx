import type { Metadata } from "next";

import { PropertyForm } from "@/components/dashboard/property-form";

export const metadata: Metadata = { title: "Agregar propiedad — Argus" };

export default function NewPropertyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Agregar propiedad
        </h1>
        <p className="text-sm text-muted-foreground">
          Completa los datos y publica cuando esté lista para salir en vivo.
        </p>
      </div>
      <PropertyForm mode="create" />
    </div>
  );
}
