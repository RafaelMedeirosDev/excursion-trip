import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { CancelReservationDialog } from "@/features/reservations/components/CancelReservationDialog";
import { useConfirmReservation } from "@/features/reservations/hooks/useConfirmReservation";
import { useMarkReservationPending } from "@/features/reservations/hooks/useMarkReservationPending";
import type { Reservation } from "@/features/reservations/types";

interface ReservationStatusActionsProps {
  reservation: Reservation;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ReservationStatusActions({
  reservation,
}: ReservationStatusActionsProps) {
  const markPending = useMarkReservationPending();
  const confirm = useConfirmReservation();
  const { data: payments } = usePayments();

  if (reservation.status === "CANCELED") {
    return null;
  }

  const paidSoFar =
    payments
      ?.filter((payment) => payment.reservationId === reservation.id)
      .reduce(
        (sum, payment) =>
          sum + (payment.type === "REVERSAL" ? -payment.value : payment.value),
        0,
      ) ?? 0;

  const canMarkPending = reservation.status === "WAITLIST";
  const canConfirm =
    reservation.status === "WAITLIST" || reservation.status === "PENDING";

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Já pago: {formatCurrency(paidSoFar)} de{" "}
        {formatCurrency(reservation.agreedValue)}
      </p>

      <div className="flex flex-wrap gap-2">
        {canMarkPending && (
          <ConfirmDialog
            trigger={<Button variant="outline">Marcar como pendente</Button>}
            title="Marcar reserva como pendente?"
            description="Exige pelo menos 50% do valor combinado já pago."
            confirmLabel="Marcar como pendente"
            onConfirm={() => markPending.mutate(reservation.id)}
          />
        )}
        {canConfirm && (
          <ConfirmDialog
            trigger={<Button>Confirmar</Button>}
            title="Confirmar reserva?"
            description="Exige 100% do valor combinado já pago."
            confirmLabel="Confirmar"
            onConfirm={() => confirm.mutate(reservation.id)}
          />
        )}
        <CancelReservationDialog
          reservationId={reservation.id}
          trigger={<Button variant="destructive">Cancelar</Button>}
        />
      </div>

      {markPending.isError && (
        <p className="text-sm text-destructive">
          Não foi possível marcar como pendente. Confira se pelo menos 50% do
          valor combinado já foi pago.
        </p>
      )}
      {confirm.isError && (
        <p className="text-sm text-destructive">
          Não foi possível confirmar. Confira se 100% do valor combinado já
          foi pago.
        </p>
      )}
    </div>
  );
}
