import type { ReservationStatus } from "@excursion-trip/shared";
import { Badge } from "@/components/ui/badge";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/features/reservations/constants";

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  return (
    <Badge className={STATUS_BADGE_CLASSES[status]} variant="outline">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
