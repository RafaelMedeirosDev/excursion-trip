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
import { useUpdateExcursionStatus } from "@/features/excursions/hooks/useUpdateExcursionStatus";

interface CancelExcursionDialogProps {
  excursionId: string;
  trigger: ReactNode;
}

export function CancelExcursionDialog({
  excursionId,
  trigger,
}: CancelExcursionDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const updateStatus = useUpdateExcursionStatus();

  async function handleConfirm() {
    if (!reason.trim()) return;

    await updateStatus.mutateAsync({
      id: excursionId,
      payload: { status: "CANCELED", cancelReason: reason },
    });
    setOpen(false);
    setReason("");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar excursão</AlertDialogTitle>
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
          {updateStatus.isError && (
            <p className="text-sm text-destructive">
              Não foi possível cancelar. Tente de novo.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!reason.trim() || updateStatus.isPending}
            onClick={handleConfirm}
          >
            {updateStatus.isPending ? "Cancelando..." : "Cancelar excursão"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
