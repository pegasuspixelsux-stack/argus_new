import Link from "next/link";
import type { Metadata } from "next";
import { Plus, TriangleAlert } from "lucide-react";

import { listProperties } from "@/lib/data/properties";
import { PropertyTable } from "@/components/dashboard/property-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Propiedades — Argus" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  let properties: Awaited<ReturnType<typeof listProperties>> = [];
  let loadError: string | null = null;

  try {
    properties = await listProperties();
  } catch {
    loadError = "No pudimos cargar tu catálogo de propiedades. Recarga la página.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Catálogo de propiedades
          </h1>
          <p className="text-sm text-muted-foreground">
            {properties.length} propiedad{properties.length === 1 ? "" : "es"} en tu
            catálogo
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/properties/new" />}>
          <Plus />
          Agregar propiedad
        </Button>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Algo salió mal</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : (
        <PropertyTable properties={properties} />
      )}
    </div>
  );
}
