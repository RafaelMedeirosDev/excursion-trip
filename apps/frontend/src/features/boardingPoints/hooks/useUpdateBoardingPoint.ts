import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardingPointsApi } from "@/features/boardingPoints/api/boardingPointsApi";
import type { UpdateBoardingPointPayload } from "@/features/boardingPoints/types";

interface Variables {
  id: string;
  payload: UpdateBoardingPointPayload;
}

export function useUpdateBoardingPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      boardingPointsApi.updateBoardingPoint(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["boardingPoints"] });
      queryClient.invalidateQueries({ queryKey: ["boardingPoints", id] });
    },
  });
}
