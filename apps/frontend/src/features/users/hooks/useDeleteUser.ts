import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
