import type { Metadata } from "next";

import { getDealerSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = { title: "Configuración — Argus" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getDealerSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Datos de referencia de la agencia para el panel interno.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
