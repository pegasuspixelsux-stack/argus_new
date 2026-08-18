import { Building2, Inbox, LayoutDashboard, Users } from "lucide-react";

export const MAIN_NAV_ITEMS = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    match: (path: string) => path === "/dashboard",
  },
  {
    label: "Propiedades",
    href: "/dashboard/properties",
    icon: Building2,
    match: (path: string) => path.startsWith("/dashboard/properties"),
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Inbox,
    match: (path: string) => path.startsWith("/dashboard/leads"),
  },
  {
    label: "Usuarios",
    href: "/dashboard/users",
    icon: Users,
    match: (path: string) => path.startsWith("/dashboard/users"),
  },
];
