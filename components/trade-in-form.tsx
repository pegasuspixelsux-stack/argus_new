"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";

import { submitTradeInAction } from "@/lib/actions/trade-ins";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONDITIONS = [
  { value: "excellent", label: "Excelente" },
  { value: "good", label: "Bueno" },
  { value: "fair", label: "Regular" },
  { value: "poor", label: "Malo" },
];

interface FormState {
  year: string;
  make: string;
  model: string;
  mileage: string;
  condition: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const INITIAL_STATE: FormState = {
  year: "",
  make: "",
  model: "",
  mileage: "",
  condition: "good",
  name: "",
  email: "",
  phone: "",
  notes: "",
};

export function TradeInForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    const result = await submitTradeInAction(form);
    if (result.ok) {
      setStatus("sent");
    } else {
      setError(result.error ?? "Algo salió mal. Inténtalo de nuevo.");
      setStatus("idle");
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Solicita una tasación</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "sent" ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <CircleCheck />
            <AlertDescription>
              ¡Gracias{form.name ? `, ${form.name.split(" ")[0]}` : ""}!
              Recibimos los datos de tu vehículo y te contactaremos con una
              tasación a la brevedad.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <TriangleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="col-span-1 flex flex-col gap-1.5">
                <Label htmlFor="trade-year">Año</Label>
                <Input
                  id="trade-year"
                  required
                  inputMode="numeric"
                  value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  placeholder="2019"
                />
              </div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <Label htmlFor="trade-make">Marca</Label>
                <Input
                  id="trade-make"
                  required
                  value={form.make}
                  onChange={(e) => update("make", e.target.value)}
                  placeholder="Toyota"
                />
              </div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <Label htmlFor="trade-model">Modelo</Label>
                <Input
                  id="trade-model"
                  required
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder="Corolla"
                />
              </div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <Label htmlFor="trade-mileage">Kilometraje</Label>
                <Input
                  id="trade-mileage"
                  inputMode="numeric"
                  value={form.mileage}
                  onChange={(e) => update("mileage", e.target.value)}
                  placeholder="65.000"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trade-condition">Estado</Label>
              <Select
                items={CONDITIONS}
                value={form.condition}
                onValueChange={(value) => value && update("condition", value)}
              >
                <SelectTrigger id="trade-condition" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trade-name">Nombre</Label>
                <Input
                  id="trade-name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trade-phone">Teléfono</Label>
                <Input
                  id="trade-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="099 123 456"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trade-email">Correo electrónico</Label>
              <Input
                id="trade-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="juan@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trade-notes">¿Algo más que debamos saber?</Label>
              <Textarea
                id="trade-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Historial de choques, modificaciones, etc."
              />
            </div>

            <Button type="submit" disabled={status === "loading"} className="w-full">
              {status === "loading" ? <Loader2 className="animate-spin" /> : null}
              Solicitar tasación
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
