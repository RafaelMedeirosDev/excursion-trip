import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/features/reservations/api/reservationsApi";

export function useReservation(id: string) {
  return useQuery({
    queryKey: ["reservations", id],
    queryFn: () => reservationsApi.getReservationById(id),
    enabled: Boolean(id),
  });
}
