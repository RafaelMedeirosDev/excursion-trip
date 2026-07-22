import { Button } from "@/components/ui/button";
import { CancelReservationDialog } from "@/features/reservations/components/CancelReservationDialog";
import type { Reservation } from "@/features/reservations/types";

interface ReservationStatusActionsProps {
  reservation: Reservation;
}

// "Marcar como pendente"/"Confirmar" ficam de fora até o módulo de Payments
// existir — as duas transições exigem pagamento registrado, e sem Payments
// não tem como o usuário registrar nenhum pela UI ainda.
export function ReservationStatusActions({
  reservation,
}: ReservationStatusActionsProps) {
  if (reservation.status === "CANCELED") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <CancelReservationDialog
        reservationId={reservation.id}
        trigger={<Button variant="destructive">Cancelar</Button>}
      />
    </div>
  );
}
