import { type ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCancelReservation } from "@/features/reservations/hooks/useCancelReservation";

interface CancelReservationDialogProps {
  reservationId: string;
  trigger: ReactNode;
}

export function CancelReservationDialog({
  reservationId,
  trigger,
}: CancelReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const cancelReservation = useCancelReservation();

  async function handleConfirm() {
    if (!reason.trim()) return;

    await cancelReservation.mutateAsync({
      id: reservationId,
      payload: { cancelReason: reason },
    });
    setOpen(false);
    setReason("");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Informe o motivo do
            cancelamento.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancelReason">Motivo</Label>
          <Textarea
            id="cancelReason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          {cancelReservation.isError && (
            <p className="text-sm text-destructive">
              Não foi possível cancelar. Tente de novo.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!reason.trim() || cancelReservation.isPending}
            onClick={handleConfirm}
          >
            {cancelReservation.isPending ? "Cancelando..." : "Cancelar reserva"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
