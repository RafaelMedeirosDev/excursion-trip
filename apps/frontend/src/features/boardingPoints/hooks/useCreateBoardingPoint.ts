import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardingPointsApi } from "@/features/boardingPoints/api/boardingPointsApi";

export function useCreateBoardingPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: boardingPointsApi.createBoardingPoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boardingPoints"] });
    },
  });
}
