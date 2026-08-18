import { ScrollReveal } from "@/components/scroll-reveal";

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Por qué elegirnos
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Precios claros, propiedades verificadas y un equipo que se
            involucra de verdad
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">
                Todas las propiedades verificadas.
              </span>{" "}
              Cada propiedad de nuestro catálogo pasa una verificación de
              documentación y estado antes de publicarse, así lo que ves es
              lo que hay.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Precios claros, sin sorpresas.
              </span>{" "}
              Sin costos ocultos ni sorpresas de último momento — el precio
              que ves es el que negocias, más financiación hipotecaria
              flexible.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Te acompañamos hasta el cierre.
              </span>{" "}
              Desde la documentación hasta la escritura, nuestro equipo
              sigue ahí mucho después de mostrarte la propiedad — porque
              para nosotros, cada operación importa.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
