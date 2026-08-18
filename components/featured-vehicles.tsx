import { listPublishedVehicles } from "@/lib/data/vehicles";
import { VehicleCard } from "@/components/vehicle-card";
import { ScrollReveal } from "@/components/scroll-reveal";

export async function FeaturedVehiclesSection() {
  let vehicles: Awaited<ReturnType<typeof listPublishedVehicles>> = [];
  try {
    vehicles = await listPublishedVehicles(4);
  } catch {
    // Keep the marketing page usable even if Firestore is unreachable.
    return null;
  }

  if (vehicles.length === 0) return null;

  return (
    <section id="inventory" className="border-b border-border/60 bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Unidades Seleccionadas
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Un vistazo a lo que tenemos en stock, actualizado a medida que
            entran vehículos.
          </p>
        </ScrollReveal>

        <ScrollReveal
          delay={0.1}
          className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto -mx-4 px-4 pb-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
        >
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="w-3/4 shrink-0 snap-start sm:w-auto">
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
