import type { ReservationStatus } from "@excursion-trip/shared";
import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/features/reservations/api/reservationsApi";

export function useReservations(status?: ReservationStatus) {
  return useQuery({
    queryKey: ["reservations", { status }],
    queryFn: () => reservationsApi.getReservations(status),
  });
}
