import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/features/reservations/api/reservationsApi";
import type { CancelReservationPayload } from "@/features/reservations/types";

interface Variables {
  id: string;
  payload: CancelReservationPayload;
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      reservationsApi.cancelReservation(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservations", id] });
    },
  });
}
