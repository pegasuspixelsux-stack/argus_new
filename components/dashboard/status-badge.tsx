import { Badge } from "@/components/ui/badge";
import type { VehicleStatus } from "@/types/vehicle";

export function StatusBadge({ status }: { status: VehicleStatus }) {
  if (status === "published") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
        Publicado
      </Badge>
    );
  }
  return <Badge variant="secondary">Borrador</Badge>;
}
