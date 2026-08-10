import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { vehicleBookingsApi } from "@/features/vehicleBookings/api/vehicleBookingsApi";

export function usePaginatedVehicleBookings({
  query,
  page,
  limit = 10,
}: {
  query?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["vehicleBookings", "paginated", { query, page, limit }],
    queryFn: () =>
      vehicleBookingsApi.getVehicleBookingsPaginated({ query, page, limit }),
    placeholderData: keepPreviousData,
  });
}
