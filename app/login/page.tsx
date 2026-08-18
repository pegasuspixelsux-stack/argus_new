import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Iniciar sesión — Argus",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-muted/30 px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al sitio
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Inicia sesión para gestionar tu catálogo de propiedades.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
