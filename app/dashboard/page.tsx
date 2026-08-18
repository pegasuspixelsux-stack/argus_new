import Link from "next/link";
import type { Metadata } from "next";
import { Building2, CheckCircle2, Inbox, Users } from "lucide-react";

import { listProperties } from "@/lib/data/properties";
import { listAppUsers } from "@/lib/data/users";
import { listLeads, type Lead } from "@/lib/data/leads";
import { listContactMessages, type ContactMessage } from "@/lib/data/contact";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Panel — Argus" };
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("es-UY", { dateStyle: "medium" });

function settled<T>(result: PromiseSettledResult<T[]>): T[] {
  return result.status === "fulfilled" ? result.value : [];
}

type LeadKind = "property" | "contact";

interface UnifiedLead {
  id: string;
  kind: LeadKind;
  title: string;
  name: string;
  createdAt: string;
}

const KIND_LABELS: Record<LeadKind, string> = {
  property: "Propiedad",
  contact: "Contacto",
};

function toUnifiedLeads(leads: Lead[], contactMessages: ContactMessage[]): UnifiedLead[] {
  const unified: UnifiedLead[] = [
    ...leads.map((lead) => ({
      id: lead.id,
      kind: "property" as const,
      title: lead.propertyTitle,
      name: lead.name,
      createdAt: lead.createdAt,
    })),
    ...contactMessages.map((message) => ({
      id: message.id,
      kind: "contact" as const,
      title: "Mensaje de contacto",
      name: message.name,
      createdAt: message.createdAt,
    })),
  ];
  return unified.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default async function DashboardHomePage() {
  const [propertiesResult, usersResult, leadsResult, contactResult] = await Promise.allSettled([
    listProperties(),
    listAppUsers(),
    listLeads(),
    listContactMessages(),
  ]);

  const properties = settled(propertiesResult);
  const users = settled(usersResult);
  const leads = settled(leadsResult);
  const contactMessages = settled(contactResult);

  const publishedCount = properties.filter((p) => p.status === "published").length;
  const activeUsersCount = users.filter((u) => !u.disabled).length;
  const totalLeadsCount = leads.length + contactMessages.length;

  const kpis = [
    { label: "Propiedades en catálogo", value: properties.length, icon: Building2 },
    { label: "Publicadas", value: publishedCount, icon: CheckCircle2 },
    { label: "Leads totales", value: totalLeadsCount, icon: Inbox },
    { label: "Usuarios activos", value: activeUsersCount, icon: Users },
  ];

  const recentProperties = properties.slice(0, 5);
  const recentLeads = toUnifiedLeads(leads, contactMessages).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resumen</h1>
        <p className="text-sm text-muted-foreground">
          Un vistazo general a tu catálogo y tus leads.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <kpi.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimas propiedades</CardTitle>
              <Link href="/dashboard/properties" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {recentProperties.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay propiedades
              </p>
            ) : (
              recentProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/dashboard/properties/${property.id}/edit`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {property.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={property.photos[0].url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <Building2 className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {property.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(property.updatedAt))}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={property.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimos leads</CardTitle>
              <Link href="/dashboard/leads" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay leads
              </p>
            ) : (
              recentLeads.map((lead) => (
                <div key={`${lead.kind}-${lead.id}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{lead.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline">{KIND_LABELS[lead.kind]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
