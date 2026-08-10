import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { customersApi } from "@/features/customers/api/customersApi";

export function usePaginatedCustomers({
  query,
  page,
  limit = 10,
}: {
  query?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["customers", "paginated", { query, page, limit }],
    queryFn: () => customersApi.getCustomersPaginated({ query, page, limit }),
    placeholderData: keepPreviousData,
  });
}
