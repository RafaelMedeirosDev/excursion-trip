import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excursionsApi } from "@/features/excursions/api/excursionsApi";
import type { UpdateExcursionPayload } from "@/features/excursions/types";

interface Variables {
  id: string;
  payload: UpdateExcursionPayload;
}

export function useUpdateExcursion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      excursionsApi.updateExcursion(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["excursions"] });
      queryClient.invalidateQueries({ queryKey: ["excursions", id] });
    },
  });
}
