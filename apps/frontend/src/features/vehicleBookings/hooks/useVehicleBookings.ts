import { useQuery } from "@tanstack/react-query";
import { vehicleBookingsApi } from "@/features/vehicleBookings/api/vehicleBookingsApi";

export function useVehicleBookings() {
  return useQuery({
    queryKey: ["vehicleBookings"],
    queryFn: vehicleBookingsApi.getVehicleBookings,
  });
}
