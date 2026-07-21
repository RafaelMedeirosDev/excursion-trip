import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
