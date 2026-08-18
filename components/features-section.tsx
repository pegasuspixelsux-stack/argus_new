import type { LucideIcon } from "lucide-react";
import { BadgeCheck, HandCoins, Wrench } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollReveal } from "@/components/scroll-reveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Todos los vehículos revisados",
    description:
      "Cada auto de nuestro stock pasa una inspección de múltiples puntos antes de publicarse, así lo que ves es lo que hay.",
  },
  {
    icon: HandCoins,
    title: "Precios claros, sin sorpresas",
    description:
      "Sin costos ocultos ni sorpresas de último momento — el precio que ves es el que pagas, más financiación flexible.",
  },
  {
    icon: Wrench,
    title: "Te acompañamos después de la venta",
    description:
      "Desde el papeleo hasta tu próximo trade-in, nuestro equipo sigue ahí mucho después de que te llevas el auto.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Por qué comprarnos a nosotros
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Precios claros, vehículos revisados y un equipo que trata cada
            venta como si importara — porque importa.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1}>
              <Card className="ring-border/60">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[0.925rem] leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
