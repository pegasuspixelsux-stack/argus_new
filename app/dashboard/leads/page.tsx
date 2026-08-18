import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { listLeads } from "@/lib/data/leads";
import { listTradeInLeads } from "@/lib/data/trade-ins";
import { listContactMessages } from "@/lib/data/contact";
import { LeadsView } from "@/components/dashboard/leads-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Leads — Dealio" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let tradeInLeads: Awaited<ReturnType<typeof listTradeInLeads>> = [];
  let contactMessages: Awaited<ReturnType<typeof listContactMessages>> = [];
  let loadError = false;

  try {
    [leads, tradeInLeads, contactMessages] = await Promise.all([
      listLeads(),
      listTradeInLeads(),
      listContactMessages(),
    ]);
  } catch {
    loadError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Consultas de vehículos, solicitudes de permuta y mensajes de contacto.
        </p>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Algo salió mal</AlertTitle>
          <AlertDescription>No pudimos cargar los leads. Recarga la página.</AlertDescription>
        </Alert>
      ) : (
        <LeadsView leads={leads} tradeInLeads={tradeInLeads} contactMessages={contactMessages} />
      )}
    </div>
  );
}
