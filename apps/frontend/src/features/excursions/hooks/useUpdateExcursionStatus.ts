import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excursionsApi } from "@/features/excursions/api/excursionsApi";
import type { UpdateExcursionStatusPayload } from "@/features/excursions/types";

interface Variables {
  id: string;
  payload: UpdateExcursionStatusPayload;
}

export function useUpdateExcursionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      excursionsApi.updateExcursionStatus(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["excursions"] });
      queryClient.invalidateQueries({ queryKey: ["excursions", id] });
    },
  });
}
