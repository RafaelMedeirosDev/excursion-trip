import { useQuery } from "@tanstack/react-query";
import { boardingPointsApi } from "@/features/boardingPoints/api/boardingPointsApi";

export function useBoardingPoints() {
  return useQuery({
    queryKey: ["boardingPoints"],
    queryFn: boardingPointsApi.getBoardingPoints,
  });
}
