import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";

export function usePaginatedUsers({
  query,
  page,
  limit = 10,
}: {
  query?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["users", "paginated", { query, page, limit }],
    queryFn: () => usersApi.getUsersPaginated({ query, page, limit }),
    placeholderData: keepPreviousData,
  });
}
