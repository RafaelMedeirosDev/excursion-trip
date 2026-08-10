import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { excursionsApi } from "@/features/excursions/api/excursionsApi";
import type { ExcursionStatus } from "@/features/excursions/types";

export function usePaginatedExcursions({
  status,
  eventName,
  page,
  limit = 10,
}: {
  status?: ExcursionStatus;
  eventName?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["excursions", "paginated", { status, eventName, page, limit }],
    queryFn: () =>
      excursionsApi.getExcursionsPaginated({ status, eventName, page, limit }),
    placeholderData: keepPreviousData,
  });
}
