import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/features/payments/api/paymentsApi";

export function usePaginatedPayments({
  query,
  page,
  limit = 10,
}: {
  query?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["payments", "paginated", { query, page, limit }],
    queryFn: () => paymentsApi.getPaymentsPaginated({ query, page, limit }),
    placeholderData: keepPreviousData,
  });
}
