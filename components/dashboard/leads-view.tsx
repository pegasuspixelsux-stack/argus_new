"use client";

import { useState } from "react";

import type { Lead } from "@/lib/data/leads";
import type { TradeInLead } from "@/lib/data/trade-ins";
import type { ContactMessage } from "@/lib/data/contact";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  dateStyle: "medium",
  timeStyle: "short",
});

type Tab = "vehicles" | "trade-ins" | "contact";

export function LeadsView({
  leads,
  tradeInLeads,
  contactMessages,
}: {
  leads: Lead[];
  tradeInLeads: TradeInLead[];
  contactMessages: ContactMessage[];
}) {
  const [tab, setTab] = useState<Tab>("vehicles");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "vehicles", label: "Consultas de vehículos", count: leads.length },
    { id: "trade-ins", label: "Permutas", count: tradeInLeads.length },
    { id: "contact", label: "Contacto", count: contactMessages.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "vehicles" ? (
        leads.length === 0 ? (
          <EmptyState message="Todavía no hay consultas sobre vehículos." />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-foreground">{lead.vehicleTitle}</TableCell>
                    <TableCell>
                      <p className="text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground" title={lead.message}>
                      {lead.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}

      {tab === "trade-ins" ? (
        tradeInLeads.length === 0 ? (
          <EmptyState message="Todavía no hay solicitudes de permuta." />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeInLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-foreground">
                      {lead.year} {lead.make} {lead.model}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.condition}</TableCell>
                    <TableCell>
                      <p className="text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}

      {tab === "contact" ? (
        contactMessages.length === 0 ? (
          <EmptyState message="Todavía no hay mensajes de contacto." />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground" title={message.message}>
                      {message.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(message.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
