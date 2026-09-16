import type { ReservationStatus } from "@excursion-trip/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/features/reservations/api/reservationsApi";

export function usePaginatedReservations({
  status,
  query,
  page,
  limit = 10,
}: {
  status?: ReservationStatus;
  query?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["reservations", "paginated", { status, query, page, limit }],
    queryFn: () =>
      reservationsApi.getReservationsPaginated({ status, query, page, limit }),
    placeholderData: keepPreviousData,
  });
}
