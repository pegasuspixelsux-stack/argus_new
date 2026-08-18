import { ScrollReveal } from "@/components/scroll-reveal";

const STATS = [
  { value: "500+", label: "Propiedades vendidas" },
  { value: "4.8★", label: "Valoración promedio" },
  { value: "48 h", label: "Tiempo de respuesta" },
];

/** Full-width, boxed trust band — the promoted, standalone version of the stats that used to live inline inside AboutSection. */
export function StatsSection() {
  return (
    <section className="border-b border-border/60 bg-muted/20 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-8 text-center shadow-sm"
            >
              <span className="text-4xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
