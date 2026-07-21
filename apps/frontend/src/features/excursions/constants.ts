import type { ExcursionStatus } from "@/features/excursions/types";

export const ALLOWED_TRANSITIONS: Record<ExcursionStatus, ExcursionStatus[]> =
  {
    PLANNING: ["OPEN", "CANCELED"],
    OPEN: ["CLOSED", "CANCELED"],
    CLOSED: ["DONE", "CANCELED"],
    DONE: [],
    CANCELED: [],
  };

export const STATUS_LABELS: Record<ExcursionStatus, string> = {
  PLANNING: "Planejamento",
  OPEN: "Aberta",
  CLOSED: "Fechada",
  DONE: "Concluída",
  CANCELED: "Cancelada",
};

export const STATUS_BADGE_CLASSES: Record<ExcursionStatus, string> = {
  PLANNING: "bg-secondary text-secondary-foreground",
  OPEN: "bg-green-100 text-green-800 hover:bg-green-100",
  CLOSED: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  DONE: "bg-slate-200 text-slate-700 hover:bg-slate-200",
  CANCELED: "bg-red-100 text-red-800 hover:bg-red-100",
};
