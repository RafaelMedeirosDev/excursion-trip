import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";
import type { UpdateUserPayload } from "@/features/users/types";

interface Variables {
  id: string;
  payload: UpdateUserPayload;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      usersApi.updateUser(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}
