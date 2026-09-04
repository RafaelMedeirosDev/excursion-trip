import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/features/events/api/eventsApi";
import type { UpdateEventPayload } from "@/features/events/types";

interface Variables {
  id: string;
  payload: UpdateEventPayload;
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      eventsApi.updateEvent(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", id] });
    },
  });
}
