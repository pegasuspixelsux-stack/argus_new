import { ScrollReveal } from "@/components/scroll-reveal";

const STATS = [
  { value: "10 mil+", label: "Vehículos entregados" },
  { value: "4.8★", label: "Valoración promedio" },
  { value: "48 h", label: "Tiempo de respuesta" },
];

export function AboutSection() {
  return (
    <section id="about" className="border-b border-border/60 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <ScrollReveal className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop"
              alt="Un integrante del equipo de Dealio"
              className="aspect-square w-full object-cover"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="order-1 lg:order-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Sobre nosotros
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Gente que entiende de autos, no solo de ventas
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Somos un equipo chico que revisa cada vehículo antes de
            ofrecerlo, negocia con precios claros y sigue disponible mucho
            después de que te llevas el auto. Comprar un usado no tiene por
            qué ser complicado.
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-border/60 pt-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </dd>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </dl>
        </ScrollReveal>
      </div>
    </section>
  );
}
