"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import {
  NAV_LINK_ACTIVE,
  NAV_LINK_CLASS,
  NAV_LINK_INACTIVE,
} from "@/components/dashboard/dashboard-nav";
import { MAIN_NAV_ITEMS } from "@/components/dashboard/dashboard-nav-items";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardMobileNav() {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
        <Menu />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {MAIN_NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <SheetClose
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    className={cn(NAV_LINK_CLASS, active ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE)}
                  />
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </SheetClose>
            );
          })}
        </nav>

        <SheetFooter className="border-t border-border">
          <SheetClose
            render={
              <Link
                href="/dashboard/settings"
                className={cn(NAV_LINK_CLASS, settingsActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE)}
              />
            }
          >
            <Settings className="size-4" />
            Configuración
          </SheetClose>
          <SheetClose render={<Link href="/" className={cn(NAV_LINK_CLASS, NAV_LINK_INACTIVE)} />}>
            <ArrowLeft className="size-4" />
            Volver al sitio
          </SheetClose>
          <SignOutButton className={cn(NAV_LINK_CLASS, NAV_LINK_INACTIVE, "w-full")} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
