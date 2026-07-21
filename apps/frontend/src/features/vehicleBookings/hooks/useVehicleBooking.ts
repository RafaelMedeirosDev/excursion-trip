import { useQuery } from "@tanstack/react-query";
import { vehicleBookingsApi } from "@/features/vehicleBookings/api/vehicleBookingsApi";

export function useVehicleBooking(id: string) {
  return useQuery({
    queryKey: ["vehicleBookings", id],
    queryFn: () => vehicleBookingsApi.getVehicleBookingById(id),
    enabled: Boolean(id),
  });
}
