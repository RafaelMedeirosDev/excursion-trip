import type { ReservationStatus } from "@excursion-trip/shared";

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  WAITLIST: "Lista de espera",
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELED: "Cancelada",
};

export const STATUS_BADGE_CLASSES: Record<ReservationStatus, string> = {
  WAITLIST: "bg-secondary text-secondary-foreground",
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-100",
  CANCELED: "bg-red-100 text-red-800 hover:bg-red-100",
};
