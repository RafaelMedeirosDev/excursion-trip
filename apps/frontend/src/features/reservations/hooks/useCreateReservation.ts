import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/features/reservations/api/reservationsApi";

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
