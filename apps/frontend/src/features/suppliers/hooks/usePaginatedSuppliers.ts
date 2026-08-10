import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";

export function usePaginatedSuppliers({
  query,
  page,
  limit = 10,
}: {
  query?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["suppliers", "paginated", { query, page, limit }],
    queryFn: () => suppliersApi.getSuppliersPaginated({ query, page, limit }),
    placeholderData: keepPreviousData,
  });
}
