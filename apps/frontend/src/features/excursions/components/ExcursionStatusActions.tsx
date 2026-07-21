import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { CancelExcursionDialog } from "@/features/excursions/components/CancelExcursionDialog";
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABELS,
} from "@/features/excursions/constants";
import { useUpdateExcursionStatus } from "@/features/excursions/hooks/useUpdateExcursionStatus";
import type { Excursion, ExcursionStatus } from "@/features/excursions/types";

interface ExcursionStatusActionsProps {
  excursion: Excursion;
}

export function ExcursionStatusActions({
  excursion,
}: ExcursionStatusActionsProps) {
  const updateStatus = useUpdateExcursionStatus();
  const transitions = ALLOWED_TRANSITIONS[excursion.status];

  if (transitions.length === 0) {
    return null;
  }

  function handleConfirm(status: ExcursionStatus) {
    updateStatus.mutate({ id: excursion.id, payload: { status } });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((status) =>
        status === "CANCELED" ? (
          <CancelExcursionDialog
            key={status}
            excursionId={excursion.id}
            trigger={<Button variant="destructive">Cancelar</Button>}
          />
        ) : (
          <ConfirmDialog
            key={status}
            trigger={<Button>{STATUS_LABELS[status]}</Button>}
            title={`Mudar status para "${STATUS_LABELS[status]}"?`}
            confirmLabel="Confirmar"
            onConfirm={() => handleConfirm(status)}
          />
        ),
      )}
    </div>
  );
}
