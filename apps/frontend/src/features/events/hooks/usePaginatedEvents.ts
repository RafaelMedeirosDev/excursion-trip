import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { eventsApi } from "@/features/events/api/eventsApi";

export function usePaginatedEvents({
  name,
  page,
  limit = 10,
}: {
  name?: string;
  page: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["events", "paginated", { name, page, limit }],
    queryFn: () => eventsApi.getEventsPaginated({ name, page, limit }),
    placeholderData: keepPreviousData,
  });
}
