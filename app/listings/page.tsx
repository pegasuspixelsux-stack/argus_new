import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { listPublishedProperties } from "@/lib/data/properties";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingsView } from "@/components/listings/listings-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Propiedades disponibles — Argus",
  description:
    "Explora todas las propiedades disponibles en Argus y filtra por tipo, dormitorios, zona y precio.",
};

export default async function ListingsPage() {
  let properties: Awaited<ReturnType<typeof listPublishedProperties>> = [];
  let loadError = false;
  try {
    properties = await listPublishedProperties(12);
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
              Propiedades disponibles
            </h1>
            <p className="mt-2 text-muted-foreground">
              Filtra por tipo, dormitorios, zona y precio para encontrar tu próxima propiedad.
            </p>
          </div>

          {loadError ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Algo salió mal</AlertTitle>
              <AlertDescription>
                No pudimos cargar las propiedades disponibles. Recarga la página.
              </AlertDescription>
            </Alert>
          ) : (
            <ListingsView properties={properties} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
