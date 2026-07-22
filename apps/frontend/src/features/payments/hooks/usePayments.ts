import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/features/payments/api/paymentsApi";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.getPayments,
  });
}
