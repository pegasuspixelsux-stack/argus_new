"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";

import { submitLeadAction } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LeadForm({
  vehicleId,
  vehicleTitle,
}: {
  vehicleId: string;
  vehicleTitle: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(`Estoy interesado/a en ${vehicleTitle}. ¿Sigue disponible?`);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    const result = await submitLeadAction({ vehicleId, vehicleTitle, name, email, message });
    if (result.ok) {
      setStatus("sent");
    } else {
      setError(result.error ?? "Algo salió mal. Inténtalo de nuevo.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
        <CircleCheck />
        <AlertDescription>
          ¡Gracias{name ? `, ${name.split(" ")[0]}` : ""}! Recibimos tu
          mensaje y te responderemos a la brevedad.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-name">Nombre</Label>
        <Input
          id="lead-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-email">Correo electrónico</Label>
        <Input
          id="lead-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-message">Mensaje</Label>
        <Textarea
          id="lead-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? <Loader2 className="animate-spin" /> : null}
        Enviar mensaje
      </Button>
    </form>
  );
}
