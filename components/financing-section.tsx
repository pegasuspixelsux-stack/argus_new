import { Landmark } from "lucide-react";

import { FinancingCalculator } from "@/components/financing-calculator";
import { ScrollReveal } from "@/components/scroll-reveal";

const POINTS = [
  "Plazos flexibles de 15 a 30 años",
  "Simular no afecta tu historial crediticio",
  "Solicita financiación real cuando encuentres tu próxima propiedad",
];

export function FinancingSection() {
  return (
    <section id="financing" className="border-b border-border/60 bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <ScrollReveal>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <Landmark className="size-4" />
            Financiación
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Calcula cuánto te podría costar
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Obtén una estimación rápida de tu cuota mensual antes de visitar
            la propiedad. Ajusta el precio, la cuota inicial, la tasa y el
            plazo para encontrar lo que se adapta a tu presupuesto.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <FinancingCalculator />
        </ScrollReveal>
      </div>
    </section>
  );
}
