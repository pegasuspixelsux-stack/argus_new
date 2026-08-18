import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProperty } from "@/lib/data/properties";
import { PropertyForm } from "@/components/dashboard/property-form";

export const metadata: Metadata = { title: "Editar propiedad — Argus" };

export default async function EditPropertyPage({
  params,
}: PageProps<"/dashboard/properties/[id]/edit">) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {property.title}
        </h1>
        <p className="text-sm text-muted-foreground">Actualiza los datos de esta publicación.</p>
      </div>
      <PropertyForm mode="edit" property={property} />
    </div>
  );
}
