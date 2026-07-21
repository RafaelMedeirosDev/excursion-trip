import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "@/features/events/api/eventsApi";

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => eventsApi.getEventById(id),
    enabled: Boolean(id),
  });
}
