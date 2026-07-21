import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excursionsApi } from "@/features/excursions/api/excursionsApi";

export function useCreateExcursion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: excursionsApi.createExcursion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["excursions"] });
    },
  });
}
