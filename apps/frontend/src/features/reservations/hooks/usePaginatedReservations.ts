import type { ReservationStatus } from "@excursion-trip/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/features/reservations/api/reservationsApi";

export function usePaginatedReservations({
  status,
  eventName,
  page,
  limit = 10,
}: {
  status?: ReservationStatus;
  eventName?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["reservations", "paginated", { status, eventName, page, limit }],
    queryFn: () =>
      reservationsApi.getReservationsPaginated({ status, eventName, page, limit }),
    placeholderData: keepPreviousData,
  });
}
