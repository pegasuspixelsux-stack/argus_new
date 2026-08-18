import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ScrollReveal } from "@/components/scroll-reveal";

/**
 * Compact two-column teaser ("half a section") that sits right after the
 * hero/search area and before the featured listings — a quick "who we are"
 * before the reader gets into inventory. Links to the full About section
 * further down the page (#about) for anyone who wants more.
 */
export function WhoWeAreSection() {
  return (
    <section className="border-b border-border/60 py-14 sm:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Quiénes somos
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            La inmobiliaria que simplifica cada paso de comprar, vender o alquilar
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="text-balance text-muted-foreground">
            En Argus combinamos atención personalizada con procesos claros:
            verificamos cada propiedad, negociamos con precios transparentes
            y te acompañamos de principio a fin, ya sea que estés comprando
            tu próximo hogar, vendiendo el actual o buscando un alquiler de
            confianza.
          </p>
          <Link
            href="#about"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
          >
            Conocé más sobre nosotros
            <ArrowRight className="size-3.5" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
