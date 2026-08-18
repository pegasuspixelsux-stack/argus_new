import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";

/**
 * Closing call-to-action for the consultative/boutique homepage flow —
 * invites the reader to talk to an advisor instead of self-serving through
 * a search grid. Sits right before ContactSection, whose form is where the
 * "agendar una consulta" button lands.
 */
export function AdvisoryCtaSection() {
  return (
    <section id="asesoria" className="border-b border-border/60 bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Asesoría personalizada
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            ¿Querés trabajar con nosotros?
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Contanos qué estás buscando y un asesor de Argus te va a
            contactar para ayudarte a comprar, vender o alquilar tu próxima
            propiedad, sin vueltas.
          </p>
          <Button
            size="lg"
            className="mt-8"
            nativeButton={false}
            render={<Link href="#contact" />}
          >
            <MessageCircle />
            Agendar una consulta
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
