import { ScrollReveal } from "@/components/scroll-reveal";

const BANKS = ["BROU", "Santander", "Itaú", "BBVA", "Scotiabank", "HSBC"];
// Duplicated once so the marquee can loop seamlessly at -50%.
const TRACK = [...BANKS, ...BANKS];

export function FinancingPartnersTicker() {
  return (
    <section className="border-b border-border/60 bg-muted/30 py-10">
      <ScrollReveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Financiación disponible a través de
        </p>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee items-center">
            {TRACK.map((bank, index) => (
              <span
                key={`${bank}-${index}`}
                className="mx-8 shrink-0 text-2xl font-bold tracking-tight text-muted-foreground/70 grayscale transition-colors hover:text-foreground sm:text-3xl"
              >
                {bank}
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
