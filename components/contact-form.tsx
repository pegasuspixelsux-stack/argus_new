"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";

import { submitContactAction } from "@/lib/actions/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    const result = await submitContactAction({ name, email, message });
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
        <CardTitle className="text-lg">Envíanos un mensaje</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "sent" ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <CircleCheck />
            <AlertDescription>
              ¡Gracias{name ? `, ${name.split(" ")[0]}` : ""}! Recibimos tu
              mensaje y te responderemos a la brevedad.
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-name">Nombre</Label>
              <Input
                id="contact-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email">Correo electrónico</Label>
              <Input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-message">¿En qué te podemos ayudar?</Label>
              <Textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tengo una consulta sobre..."
              />
            </div>

            <Button type="submit" disabled={status === "loading"} className="w-full">
              {status === "loading" ? <Loader2 className="animate-spin" /> : null}
              Enviar mensaje
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
