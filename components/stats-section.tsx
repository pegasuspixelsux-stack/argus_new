import { ScrollReveal } from "@/components/scroll-reveal";

const STATS = [
  { value: "500+", label: "Propiedades vendidas" },
  { value: "4.8★", label: "Valoración promedio" },
  { value: "48 h", label: "Tiempo de respuesta" },
];

/** Full-width trust band — plain numbers, no boxed cards, sitting directly on the section's background. */
export function StatsSection() {
  return (
    <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="grid grid-cols-1 gap-10 divide-y divide-border/60 sm:grid-cols-3 sm:gap-6 sm:divide-y-0">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center pt-10 text-center first:pt-0 sm:pt-0">
              <span className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
                {stat.value}
              </span>
              <span className="mt-2 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
