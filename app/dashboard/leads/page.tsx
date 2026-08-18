import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { listLeads } from "@/lib/data/leads";
import { listContactMessages } from "@/lib/data/contact";
import { LeadsView } from "@/components/dashboard/leads-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Leads — Argus" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let contactMessages: Awaited<ReturnType<typeof listContactMessages>> = [];
  let loadError = false;

  try {
    [leads, contactMessages] = await Promise.all([listLeads(), listContactMessages()]);
  } catch {
    loadError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Consultas de propiedades y mensajes de contacto.
        </p>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Algo salió mal</AlertTitle>
          <AlertDescription>No pudimos cargar los leads. Recarga la página.</AlertDescription>
        </Alert>
      ) : (
        <LeadsView leads={leads} contactMessages={contactMessages} />
      )}
    </div>
  );
}
