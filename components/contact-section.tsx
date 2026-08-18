import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { ScrollReveal } from "@/components/scroll-reveal";

const CONTACT_ITEMS = [
  { icon: Mail, label: "Correo", value: "hello@argus.app", href: "mailto:hello@argus.app" },
  { icon: Phone, label: "Teléfono", value: "+598 2900 1234", href: "tel:+59829001234" },
  { icon: MapPin, label: "Dirección", value: "Av. 18 de Julio 1200, Montevideo" },
  { icon: Clock, label: "Horario", value: "Lun. a sáb., 9 a 19 h" },
];

export function ContactSection() {
  return (
    <section id="contact" className="border-b border-border/60 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Contacto
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            ¿Tienes dudas? Estamos para ayudarte
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Ya sea que tengas preguntas sobre un vehículo, la financiación, o
            simplemente quieras saludar, escríbenos por el medio que más te
            convenga.
          </p>

          <dl className="mt-8 flex flex-col gap-5">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {item.href ? (
                      <a href={item.href} className="hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <ContactForm />
        </ScrollReveal>
      </div>
    </section>
  );
}
