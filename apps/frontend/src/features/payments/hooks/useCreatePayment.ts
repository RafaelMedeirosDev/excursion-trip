import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "@/features/payments/api/paymentsApi";

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
