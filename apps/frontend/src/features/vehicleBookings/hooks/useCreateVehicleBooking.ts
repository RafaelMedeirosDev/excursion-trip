import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleBookingsApi } from "@/features/vehicleBookings/api/vehicleBookingsApi";

export function useCreateVehicleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleBookingsApi.createVehicleBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleBookings"] });
    },
  });
}
