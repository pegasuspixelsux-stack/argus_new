import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";

const POINTS = [
  "Verificación de escritura y documentación antes de publicar",
  "Relevamiento del estado general de la propiedad",
  "Sesión de fotos profesional antes de la publicación",
];

export function DealerHighlightSection() {
  return (
    <section className="border-b border-border/60 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Nuestro proceso
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Cada propiedad pasa por una revisión a fondo antes de publicarse
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            No publicamos una propiedad sin revisarla de arriba a abajo.
            Documentación, estado edilicio y fotos profesionales quedan en
            orden antes de que la veas, así compras con la tranquilidad de
            saber qué estás adquiriendo.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
          <Button className="mt-8" nativeButton={false} render={<Link href="#listings" />}>
            Ver propiedades disponibles
          </Button>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="overflow-hidden rounded-2xl border border-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop"
            alt="Propiedad revisada y lista para la venta"
            className="aspect-square w-full object-cover"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
