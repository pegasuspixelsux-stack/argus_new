import { Mail, Phone } from "lucide-react";

import { ScrollReveal } from "@/components/scroll-reveal";

const TEAM = [
  {
    name: "Martina Ferreira",
    role: "Asesora senior",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
    email: "martina@argus.app",
    phone: "+598 99 123 456",
  },
  {
    name: "Lucas Bianchi",
    role: "Especialista en inversiones",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
    email: "lucas@argus.app",
    phone: "+598 99 234 567",
  },
  {
    name: "Sofía Ramírez",
    role: "Alquileres y gestión",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
    email: "sofia@argus.app",
    phone: "+598 99 345 678",
  },
  {
    name: "Diego Otero",
    role: "Fundador y asesor",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
    email: "diego@argus.app",
    phone: "+598 99 456 789",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="border-b border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop"
                alt="Un integrante del equipo de Argus"
                className="aspect-square w-full object-cover"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15} className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Sobre nosotros
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Gente que entiende de propiedades, no solo de ventas
            </h2>
            <p className="mt-4 text-balance text-muted-foreground">
              Somos un equipo chico que revisa cada propiedad antes de
              publicarla, negocia con precios claros y sigue disponible mucho
              después de firmar. Comprar o vender una propiedad no tiene por
              qué ser complicado.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.2} className="mt-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Nuestro equipo
          </p>
          <h3 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground">
            Hablá directamente con quien te va a acompañar
          </h3>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center border border-border bg-card p-6 text-center shadow-sm"
              >
                <div className="size-28 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="mt-4 flex w-full flex-col gap-2">
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-t border-border/60 pt-2">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Mail className="size-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                    <a
                      href={`tel:${member.phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Phone className="size-3.5 shrink-0" />
                      <span className="truncate">{member.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
