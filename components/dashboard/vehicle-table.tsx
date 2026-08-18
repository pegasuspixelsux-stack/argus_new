"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteVehicleAction } from "@/lib/actions/vehicles";
import type { Vehicle } from "@/types/vehicle";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function VehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      try {
        await deleteVehicleAction(id);
        toast.success("Vehículo eliminado.");
        router.refresh();
      } catch {
        toast.error("No pudimos eliminar el vehículo. Inténtalo de nuevo.");
      } finally {
        setPendingDeleteId(null);
      }
    });
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="font-medium text-foreground">Todavía no hay vehículos</p>
        <p className="text-sm text-muted-foreground">
          Agrega tu primer vehículo para empezar a armar tu stock.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehículo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {vehicle.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vehicle.photos[0].url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}/edit`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.specs.mileage != null
                          ? `${vehicle.specs.mileage.toLocaleString("es-UY")} km`
                          : "Sin kilometraje"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.status} />
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {vehicle.priceDisplay != null ? currency.format(vehicle.priceDisplay) : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(vehicle.updatedAt).toLocaleDateString("es-UY")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontal />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={<Link href={`/dashboard/vehicles/${vehicle.id}/edit`} />}
                      >
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      {vehicle.status === "published" ? (
                        <DropdownMenuItem
                          render={<Link href={`/vehicles/${vehicle.id}`} target="_blank" />}
                        >
                          <ExternalLink />
                          Ver página pública
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setPendingDeleteId(vehicle.id)}
                      >
                        <Trash2 />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto elimina de forma permanente la publicación y sus fotos de
              tu stock. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
