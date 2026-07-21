import { useQuery } from "@tanstack/react-query";
import { excursionsApi } from "@/features/excursions/api/excursionsApi";

export function useExcursion(id: string) {
  return useQuery({
    queryKey: ["excursions", id],
    queryFn: () => excursionsApi.getExcursionById(id),
    enabled: Boolean(id),
  });
}
