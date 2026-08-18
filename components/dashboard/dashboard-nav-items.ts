import { Car, Inbox, LayoutDashboard, Users } from "lucide-react";

export const MAIN_NAV_ITEMS = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    match: (path: string) => path === "/dashboard",
  },
  {
    label: "Vehículos",
    href: "/dashboard/vehicles",
    icon: Car,
    match: (path: string) => path.startsWith("/dashboard/vehicles"),
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
