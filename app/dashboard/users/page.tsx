import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { listAppUsers } from "@/lib/data/users";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Usuarios — Argus" };
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function UsersPage() {
  let users: Awaited<ReturnType<typeof listAppUsers>> = [];
  let loadError = false;

  try {
    users = await listAppUsers();
  } catch {
    loadError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} usuario{users.length === 1 ? "" : "s"} con acceso al panel
        </p>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Algo salió mal</AlertTitle>
          <AlertDescription>No pudimos cargar los usuarios. Recarga la página.</AlertDescription>
        </Alert>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-medium text-foreground">Todavía no hay usuarios</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Último acceso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {user.displayName || user.email || user.uid}
                    </p>
                    {user.displayName && user.email ? (
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {user.disabled ? (
                      <Badge variant="destructive">Deshabilitado</Badge>
                    ) : (
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                        Activo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt ? dateFormatter.format(new Date(user.createdAt)) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastSignInAt ? dateFormatter.format(new Date(user.lastSignInAt)) : "Nunca"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
