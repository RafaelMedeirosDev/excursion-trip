import { useQuery } from "@tanstack/react-query";
import { excursionsApi } from "@/features/excursions/api/excursionsApi";
import type { ExcursionStatus } from "@/features/excursions/types";

export function useExcursions(status?: ExcursionStatus) {
  return useQuery({
    queryKey: ["excursions", { status }],
    queryFn: () => excursionsApi.getExcursions(status),
  });
}
