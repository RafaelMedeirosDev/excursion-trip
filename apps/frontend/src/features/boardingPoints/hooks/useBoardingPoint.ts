import { useQuery } from "@tanstack/react-query";
import { boardingPointsApi } from "@/features/boardingPoints/api/boardingPointsApi";

export function useBoardingPoint(id: string) {
  return useQuery({
    queryKey: ["boardingPoints", id],
    queryFn: () => boardingPointsApi.getBoardingPointById(id),
    enabled: Boolean(id),
  });
}
