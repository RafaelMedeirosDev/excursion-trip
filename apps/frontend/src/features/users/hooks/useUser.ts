import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersApi.getUserById(id),
    enabled: Boolean(id),
  });
}
