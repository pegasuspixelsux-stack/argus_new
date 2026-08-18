"use client";

import { useState, type FormEvent } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { updateSettingsAction } from "@/lib/actions/settings";
import type { DealerSettings } from "@/lib/data/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsForm({ initialSettings }: { initialSettings: DealerSettings }) {
  const [form, setForm] = useState<DealerSettings>(initialSettings);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof DealerSettings>(key: K, value: DealerSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await updateSettingsAction(form);
    if (result.ok) {
      toast.success("Configuración guardada.");
    } else {
      setError(result.error ?? "No pudimos guardar la configuración.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Datos de la agencia</CardTitle>
          <CardDescription>
            Esta información se usa como referencia interna del panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="dealerName">Nombre de la agencia</Label>
            <Input
              id="dealerName"
              value={form.dealerName}
              onChange={(e) => update("dealerName", e.target.value)}
              placeholder="Argus"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contactEmail">Correo de contacto</Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="hello@argus.app"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contactPhone">Teléfono de contacto</Label>
            <Input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="+598 2900 1234"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
            <Input
              id="whatsappNumber"
              value={form.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              placeholder="59891234567"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="businessHours">Horario</Label>
            <Input
              id="businessHours"
              value={form.businessHours}
              onChange={(e) => update("businessHours", e.target.value)}
              placeholder="Lun. a sáb., 9 a 19 h"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Av. 18 de Julio 1200, Montevideo"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
