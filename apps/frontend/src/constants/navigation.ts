import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Bus,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Route,
  Ticket,
  UserCog,
  UserRound,
} from "lucide-react";

export type NavGroup = "Operacional" | "Administrativo";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: NavGroup | null;
  adminOnly: boolean;
  implemented: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    group: null,
    adminOnly: false,
    implemented: true,
  },
  {
    label: "Excursões",
    href: "/excursions",
    icon: Route,
    group: "Operacional",
    adminOnly: true,
    implemented: true,
  },
  {
    label: "Reservas",
    href: "/reservations",
    icon: Ticket,
    group: "Operacional",
    adminOnly: false,
    implemented: false,
  },
  {
    label: "Pagamentos",
    href: "/payments",
    icon: CreditCard,
    group: "Operacional",
    adminOnly: false,
    implemented: false,
  },
  {
    label: "Passageiros",
    href: "/passengers",
    icon: UserRound,
    group: "Operacional",
    adminOnly: false,
    implemented: true,
  },
  {
    label: "Eventos",
    href: "/events",
    icon: CalendarDays,
    group: "Administrativo",
    adminOnly: true,
    implemented: true,
  },
  {
    label: "Fornecedores",
    href: "/suppliers",
    icon: Building2,
    group: "Administrativo",
    adminOnly: true,
    implemented: true,
  },
  {
    label: "Veículos",
    href: "/vehicles",
    icon: Bus,
    group: "Administrativo",
    adminOnly: true,
    implemented: false,
  },
  {
    label: "Pontos de Embarque",
    href: "/boarding-points",
    icon: MapPin,
    group: "Administrativo",
    adminOnly: true,
    implemented: false,
  },
  {
    label: "Usuários",
    href: "/users",
    icon: UserCog,
    group: "Administrativo",
    adminOnly: true,
    implemented: false,
  },
];
