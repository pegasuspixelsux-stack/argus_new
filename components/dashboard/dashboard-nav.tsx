"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { MAIN_NAV_ITEMS } from "@/components/dashboard/dashboard-nav-items";

export const NAV_LINK_CLASS =
  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors";
export const NAV_LINK_ACTIVE = "bg-primary/10 text-primary";
export const NAV_LINK_INACTIVE = "text-muted-foreground hover:bg-muted hover:text-foreground";

export function DashboardNav() {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <nav className="hidden lg:flex lg:h-full lg:flex-col lg:gap-4">
      <div className="flex flex-col gap-1">
        {MAIN_NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(NAV_LINK_CLASS, active ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE)}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        <Link
          href="/dashboard/settings"
          className={cn(NAV_LINK_CLASS, settingsActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE)}
        >
          <Settings className="size-4" />
          Configuración
        </Link>
        <Link href="/" className={cn(NAV_LINK_CLASS, NAV_LINK_INACTIVE)}>
          <ArrowLeft className="size-4" />
          Volver al sitio
        </Link>
        <SignOutButton className={cn(NAV_LINK_CLASS, NAV_LINK_INACTIVE, "w-full")} />
      </div>
    </nav>
  );
}
