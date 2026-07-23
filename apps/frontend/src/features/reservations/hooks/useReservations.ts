import type { ReservationStatus } from "@excursion-trip/shared";
import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/features/reservations/api/reservationsApi";

export function useReservations(
  status?: ReservationStatus,
  vehicleBookingId?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["reservations", { status, vehicleBookingId }],
    queryFn: () => reservationsApi.getReservations(status, vehicleBookingId),
    enabled: options?.enabled,
  });
}
