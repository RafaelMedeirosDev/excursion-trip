import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/features/payments/api/paymentsApi";

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => paymentsApi.getPaymentById(id),
    enabled: Boolean(id),
  });
}
