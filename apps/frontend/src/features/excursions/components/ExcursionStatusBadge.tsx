import { Badge } from "@/components/ui/badge";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/features/excursions/constants";
import type { ExcursionStatus } from "@/features/excursions/types";

interface ExcursionStatusBadgeProps {
  status: ExcursionStatus;
}

export function ExcursionStatusBadge({ status }: ExcursionStatusBadgeProps) {
  return (
    <Badge className={STATUS_BADGE_CLASSES[status]} variant="outline">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
